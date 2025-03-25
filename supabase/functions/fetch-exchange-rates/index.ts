
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.3'

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

// Parse XML and extract exchange rates using fast-xml-parser
function parseExchangeRates(xmlText: string) {
  console.log('Parsing exchange rates using fast-xml-parser...');
  
  // Create a parser instance with options
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  
  // Parse the XML
  const parsedData = parser.parse(xmlText);
  console.log('XML successfully parsed to JSON');
  
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
      exchangeRates.push({
        currency_code: currencyCode,
        forex_buying: parseFloat(currencyData.ForexBuying?.replace(',', '.') || '0'),
        forex_selling: parseFloat(currencyData.ForexSelling?.replace(',', '.') || '0'),
        banknote_buying: parseFloat(currencyData.BanknoteBuying?.replace(',', '.') || '0'),
        banknote_selling: parseFloat(currencyData.BanknoteSelling?.replace(',', '.') || '0'),
        cross_rate: parseFloat(currencyData.CrossRateUSD?.replace(',', '.') || '0') || null,
        update_date: updateDate
      });
    }
  }
  
  console.log(`Successfully parsed ${exchangeRates.length} currency rates`);
  return exchangeRates;
}

// Handle requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // If POST request, fetch and store exchange rates
    if (req.method === 'POST') {
      const supabase = createSupabaseClient(req);
      
      // Fetch exchange rates from TCMB
      console.log('Fetching exchange rates from TCMB...');
      const xmlText = await fetchTCMBExchangeRates();
      
      // Parse exchange rates
      console.log('Parsing exchange rates...');
      const exchangeRates = parseExchangeRates(xmlText);
      
      // Store in Supabase
      console.log('Storing exchange rates in Supabase...');
      const today = new Date().toISOString().split('T')[0];
      
      // First, check if we already have rates for today
      const { data: existingRates } = await supabase
        .from('exchange_rates')
        .select('id')
        .eq('update_date', today)
        .limit(1);
      
      let result;
      
      // If we have rates for today, update them
      if (existingRates && existingRates.length > 0) {
        // Delete existing rates for today
        await supabase
          .from('exchange_rates')
          .delete()
          .eq('update_date', today);
      }
      
      // Insert new rates
      result = await supabase
        .from('exchange_rates')
        .insert(exchangeRates)
        .select();
      
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
    }
    
    // If GET request, return the latest exchange rates
    if (req.method === 'GET') {
      const supabase = createSupabaseClient(req);
      
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
        const xmlText = await fetchTCMBExchangeRates();
        const exchangeRates = parseExchangeRates(xmlText);
        
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
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Method not allowed' 
      }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error in exchange rates function:', error);
    
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
