import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

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

// Fetch XML data from TCMB
async function fetchTCMBExchangeRates() {
  try {
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', {
      method: 'GET',
      headers: { 'Accept': 'application/xml' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error fetching TCMB exchange rates:', error);
    throw error;
  }
}

// Parse XML and extract exchange rates
function parseExchangeRates(xmlText: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  
  if (!xmlDoc) {
    throw new Error('Failed to parse XML document');
  }
  
  const exchangeRates = [];
  const currencies = xmlDoc.getElementsByTagName("Currency");
  const updateDate = xmlDoc.getElementsByTagName("Tarih_Date")[0]?.getAttribute("Tarih") || 
                    new Date().toISOString().split('T')[0];
  
  for (let i = 0; i < currencies.length; i++) {
    const currency = currencies[i];
    const currencyCode = currency.getAttribute("CurrencyCode");
    
    if (!currencyCode) continue;
    
    const forexBuying = currency.getElementsByTagName("ForexBuying")[0]?.textContent;
    const forexSelling = currency.getElementsByTagName("ForexSelling")[0]?.textContent;
    const banknoteBuying = currency.getElementsByTagName("BanknoteBuying")[0]?.textContent;
    const banknoteSelling = currency.getElementsByTagName("BanknoteSelling")[0]?.textContent;
    const crossRate = currency.getElementsByTagName("CrossRateUSD")[0]?.textContent;
    
    exchangeRates.push({
      currency_code: currencyCode,
      forex_buying: forexBuying ? parseFloat(forexBuying) : null,
      forex_selling: forexSelling ? parseFloat(forexSelling) : null,
      banknote_buying: banknoteBuying ? parseFloat(banknoteBuying) : null,
      banknote_selling: banknoteSelling ? parseFloat(banknoteSelling) : null,
      cross_rate: crossRate ? parseFloat(crossRate) : null,
      update_date: updateDate
    });
  }
  
  // Add TRY rate (base currency)
  exchangeRates.push({
    currency_code: 'TRY',
    forex_buying: 1,
    forex_selling: 1,
    banknote_buying: 1,
    banknote_selling: 1,
    cross_rate: null,
    update_date: updateDate
  });
  
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
