import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to create a Supabase client with the provided credentials
const createSupabaseClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization')
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  
  // If authorization header is present, use it
  if (authHeader) {
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    })
    return supabaseClient
  }
  
  // Otherwise, use anon key
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  })
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

// Parse XML and extract exchange rates using a simple string-based approach
function parseExchangeRates(xmlText: string) {
  console.log('Parsing exchange rates...');
  
  // Extract the date from the XML
  const dateMatch = xmlText.match(/<Tarih_Date[^>]*>([^<]*)<\/Tarih_Date>/);
  const updateDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
  
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
  
  // Extract data for each currency using string operations
  for (const currencyCode of currencies) {
    // Find the currency section in the XML
    const currencyRegex = new RegExp(`<Currency CurrencyCode="${currencyCode}"[^>]*>([\\s\\S]*?)<\/Currency>`);
    const currencyMatch = xmlText.match(currencyRegex);
    
    if (currencyMatch) {
      const currencySection = currencyMatch[1];
      
      // Extract values using regex
      const forexBuyingMatch = currencySection.match(/<ForexBuying>([^<]*)<\/ForexBuying>/);
      const forexSellingMatch = currencySection.match(/<ForexSelling>([^<]*)<\/ForexSelling>/);
      const banknoteBuyingMatch = currencySection.match(/<BanknoteBuying>([^<]*)<\/BanknoteBuying>/);
      const banknoteSellingMatch = currencySection.match(/<BanknoteSelling>([^<]*)<\/BanknoteSelling>/);
      const crossRateMatch = currencySection.match(/<CrossRateUSD>([^<]*)<\/CrossRateUSD>/);
      
      exchangeRates.push({
        currency_code: currencyCode,
        forex_buying: forexBuyingMatch ? parseFloat(forexBuyingMatch[1].replace(',', '.')) : null,
        forex_selling: forexSellingMatch ? parseFloat(forexSellingMatch[1].replace(',', '.')) : null,
        banknote_buying: banknoteBuyingMatch ? parseFloat(banknoteBuyingMatch[1].replace(',', '.')) : null,
        banknote_selling: banknoteSellingMatch ? parseFloat(banknoteSellingMatch[1].replace(',', '.')) : null,
        cross_rate: crossRateMatch ? parseFloat(crossRateMatch[1].replace(',', '.')) : null,
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
  
  // If we have rates for today, update them
  if (existingRates && existingRates.length > 0) {
    // Delete existing rates for today
    await supabase
      .from('exchange_rates')
      .delete()
      .eq('update_date', today);
  }
  
  // Insert new rates
  const result = await supabase
    .from('exchange_rates')
    .insert(exchangeRates)
    .select();
  
  // Record the update in the updates table
  await supabase
    .from('exchange_rate_updates')
    .insert({
      status: 'success',
      updated_at: new Date().toISOString(),
      message: 'Exchange rates updated successfully from TCMB',
      count: exchangeRates.length
    });
  
  return result;
}

// Handle requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabase = createSupabaseClient(req);
    
    // Fetch exchange rates from TCMB
    console.log('Fetching exchange rates from TCMB...');
    const xmlText = await fetchTCMBExchangeRates();
    
    // Parse exchange rates
    console.log('Parsing exchange rates...');
    const exchangeRates = parseExchangeRates(xmlText);
    
    // Store in Supabase
    console.log('Storing exchange rates in Supabase...');
    const result = await storeExchangeRates(supabase, exchangeRates);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Exchange rates updated successfully',
        count: exchangeRates.length,
        data: result.data
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error in fetch-daily-exchange-rates function:', error);
    
    try {
      // Log error to the updates table
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
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error processing exchange rates',
        error: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
