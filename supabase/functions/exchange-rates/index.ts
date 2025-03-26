import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.3'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Streamlined exchange rates function that handles:
 * - Fetching exchange rates from TCMB
 * - Storing rates in the database
 * - Setting up cron jobs for automatic updates
 * - Handling manual refresh requests
 * - Returning the latest exchange rates
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request URL
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const method = req.method;
    
    console.log(`Request: ${method} ${url.pathname}`);

    // Create Supabase client
    const supabase = createSupabaseClient(req);
    
    // Handle different endpoints/actions
    
    // 1. Setup cron job for daily updates
    if (path === 'setup-cron') {
      return await setupCronJob(supabase);
    }
    
    // 2. Manual fetch/refresh of rates
    if (method === 'POST') {
      return await manuallyRefreshRates(supabase);
    }
    
    // 3. Get the latest exchange rates (default action)
    return await getLatestRates(supabase);
    
  } catch (error) {
    console.error('Error in exchange rates function:', error);
    await logError(req, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error processing request',
        error: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});

// Function to create a Supabase client with the provided credentials
function createSupabaseClient(req: Request) {
  const authHeader = req.headers.get('Authorization')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  
  // If authorization header is present, use it
  if (authHeader) {
    return createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });
  }
  
  // Otherwise, use anon key
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
}

// Fetch exchange rates from TCMB
async function fetchTCMBExchangeRates() {
  try {
    console.log('Fetching TCMB exchange rates...');
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
    
    if (!response.ok) {
      console.error(`HTTP error fetching TCMB rates! Status: ${response.status}`);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Get the XML as text
    const xmlText = await response.text();
    console.log('Successfully fetched XML text from TCMB');
    return xmlText;
  } catch (error) {
    console.error('Error fetching TCMB exchange rates:', error);
    throw error;
  }
}

// Parse XML and extract exchange rates
function parseExchangeRates(xmlText: string) {
  console.log('Parsing exchange rates...');
  
  // Create a parser instance with options
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  
  // Parse the XML
  const parsedData = parser.parse(xmlText);
  
  // Extract the Tarih_Date from the parsed data
  const tarihDate = parsedData.Tarih_Date;
  const updateDate = tarihDate['@_Date'] || new Date().toISOString().split('T')[0];
  
  // Define the currencies we want to extract
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'RUB', 'CNY', 'SAR', 'NOK', 'DKK', 'SEK'];
  const exchangeRates = [];
  
  // Add TRY base currency
  exchangeRates.push({
    currency_code: 'TRY',
    forex_buying: 1,
    forex_selling: 1,
    banknote_buying: 1,
    banknote_selling: 1,
    cross_rate: null,
    update_date: updateDate
  });
  
  // Check if Tarih_Date.Currency is an array
  const currencyList = Array.isArray(tarihDate.Currency) 
    ? tarihDate.Currency 
    : [tarihDate.Currency];
  
  // Extract data for each currency
  for (const currencyData of currencyList) {
    const currencyCode = currencyData['@_CurrencyCode'];
    
    // Only process currencies we're interested in
    if (currencies.includes(currencyCode)) {
      // Fix: Handle string conversion properly
      const forexBuying = parseFloat(String(currencyData.ForexBuying || '0').replace(',', '.'));
      const forexSelling = parseFloat(String(currencyData.ForexSelling || '0').replace(',', '.'));
      const banknoteBuying = parseFloat(String(currencyData.BanknoteBuying || '0').replace(',', '.'));
      const banknoteSelling = parseFloat(String(currencyData.BanknoteSelling || '0').replace(',', '.'));
      const crossRate = currencyData.CrossRateUSD ? 
                        parseFloat(String(currencyData.CrossRateUSD).replace(',', '.')) : 
                        null;
      
      exchangeRates.push({
        currency_code: currencyCode,
        forex_buying: forexBuying,
        forex_selling: forexSelling,
        banknote_buying: banknoteBuying,
        banknote_selling: banknoteSelling,
        cross_rate: crossRate,
        update_date: updateDate
      });
    }
  }
  
  console.log(`Successfully parsed ${exchangeRates.length} currency rates`);
  return exchangeRates;
}

// Store exchange rates in the database
async function storeExchangeRates(supabase, exchangeRates) {
  console.log('Storing exchange rates in Supabase...');
  const today = exchangeRates[0].update_date;
  
  // First, check if we already have rates for today
  const { data: existingRates } = await supabase
    .from('exchange_rates')
    .select('id')
    .eq('update_date', today)
    .limit(1);
  
  // If we have rates for today, delete them
  if (existingRates && existingRates.length > 0) {
    console.log(`Deleting existing rates for ${today}...`);
    await supabase
      .from('exchange_rates')
      .delete()
      .eq('update_date', today);
  }
  
  // Insert new rates
  console.log(`Inserting ${exchangeRates.length} exchange rates...`);
  const result = await supabase
    .from('exchange_rates')
    .insert(exchangeRates)
    .select();
  
  // Record the update in the exchange_rate_updates table if it exists
  try {
    await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'success',
        updated_at: new Date().toISOString(),
        message: 'Exchange rates updated successfully from TCMB',
        count: exchangeRates.length
      });
    console.log('Update logged in exchange_rate_updates table');
  } catch (error) {
    // This is not critical, so just log the error
    console.warn('Could not log update to exchange_rate_updates table:', error);
  }
  
  return result;
}

// Setup a cron job for daily updates
async function setupCronJob(supabase) {
  console.log('Setting up exchange rate cron job...');
  
  // We need the service role key for this
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  
  // Call the SQL function to set up the cron job
  const { data, error } = await supabase.rpc('setup_exchange_rate_cron');
  
  if (error) {
    console.error('RPC error:', error);
    throw new Error(`Error setting up cron job: ${error.message}`);
  }
  
  console.log('Cron job setup successful');
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Exchange rate cron job set up successfully',
      data
    }),
    { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    }
  );
}

// Manually refresh rates
async function manuallyRefreshRates(supabase) {
  console.log('Manually refreshing exchange rates...');
  
  try {
    // Fetch exchange rates from TCMB
    const xmlText = await fetchTCMBExchangeRates();
    
    // Parse exchange rates
    const exchangeRates = parseExchangeRates(xmlText);
    
    // Store in Supabase
    const result = await storeExchangeRates(supabase, exchangeRates);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Exchange rates updated successfully',
        count: exchangeRates.length,
        rates: exchangeRates,
        data: result.data
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Error refreshing rates:", error);
    
    // Log the failure
    try {
      await supabase
        .from('exchange_rate_updates')
        .insert({
          status: 'error',
          updated_at: new Date().toISOString(),
          message: `Error refreshing rates: ${error.message}`
        });
    } catch (logErr) {
      console.warn("Could not log error to database:", logErr);
    }
    
    throw error;
  }
}

// Get the latest exchange rates
async function getLatestRates(supabase) {
  console.log('Getting latest exchange rates...');
  
  // Get the most recent date
  const { data: latestDate, error: dateError } = await supabase
    .from('exchange_rates')
    .select('update_date')
    .order('update_date', { ascending: false })
    .limit(1);
  
  if (dateError) {
    throw new Error(`Error getting latest date: ${dateError.message}`);
  }
  
  if (!latestDate || latestDate.length === 0) {
    // If no rates found, fetch fresh ones
    console.log('No rates found in database, fetching fresh ones...');
    const xmlText = await fetchTCMBExchangeRates();
    const exchangeRates = parseExchangeRates(xmlText);
    
    // Store them for future use
    await storeExchangeRates(supabase, exchangeRates);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Freshly fetched exchange rates',
        data: exchangeRates
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
  
  const mostRecentDate = latestDate[0].update_date;
  
  // Get exchange rates for the most recent date
  const { data: rates, error: ratesError } = await supabase
    .from('exchange_rates')
    .select('*')
    .eq('update_date', mostRecentDate);
  
  if (ratesError) {
    throw new Error(`Error getting exchange rates: ${ratesError.message}`);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Exchange rates retrieved successfully',
      update_date: mostRecentDate,
      data: rates
    }),
    { 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    }
  );
}

// Log errors to exchange_rate_updates table
async function logError(req, error) {
  try {
    const supabase = createSupabaseClient(req);
    await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'error',
        updated_at: new Date().toISOString(),
        message: `Error: ${error.message}`
      });
  } catch (logError) {
    console.error('Failed to log error to database:', logError);
  }
}
