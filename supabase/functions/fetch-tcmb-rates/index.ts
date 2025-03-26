
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    console.log('Starting TCMB exchange rate fetch process')
    const today = new Date().toISOString().split('T')[0]
    
    // Try to fetch exchange rates from TCMB
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml')
    
    if (!response.ok) {
      throw new Error(`TCMB API returned ${response.status}: ${response.statusText}`)
    }
    
    const xmlData = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml')
    
    if (!xmlDoc) {
      throw new Error('Failed to parse XML data')
    }
    
    const currencies = xmlDoc.querySelectorAll('Currency')
    const exchangeRates = []
    
    // Process each currency
    for (const currency of currencies) {
      const currencyCode = currency.getAttribute('CurrencyCode')
      
      // Skip if currencyCode is null
      if (!currencyCode) continue
      
      const forexBuying = parseFloat(currency.querySelector('ForexBuying')?.textContent || '0')
      const forexSelling = parseFloat(currency.querySelector('ForexSelling')?.textContent || '0')
      const banknoteBuying = parseFloat(currency.querySelector('BanknoteBuying')?.textContent || '0')
      const banknoteSelling = parseFloat(currency.querySelector('BanknoteSelling')?.textContent || '0')
      
      // Store in the database
      const { data, error } = await supabase
        .from('exchange_rates')
        .upsert({
          currency_code: currencyCode,
          forex_buying: forexBuying || null,
          forex_selling: forexSelling || null,
          banknote_buying: banknoteBuying || null,
          banknote_selling: banknoteSelling || null,
          update_date: today
        }, {
          onConflict: 'currency_code, update_date'
        })
        .select()
      
      if (error) {
        console.error(`Error upserting ${currencyCode}:`, error)
      } else {
        exchangeRates.push(data[0])
      }
    }
    
    // Always add TRY as base currency with rate 1
    const { error: tryError } = await supabase
      .from('exchange_rates')
      .upsert({
        currency_code: 'TRY',
        forex_buying: 1,
        forex_selling: 1,
        banknote_buying: 1,
        banknote_selling: 1,
        update_date: today
      }, {
        onConflict: 'currency_code, update_date'
      })
    
    if (tryError) {
      console.error('Error upserting TRY:', tryError)
    }
    
    // Log the result in exchange_rate_updates table
    const { error: logError } = await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'success',
        message: 'TCMB exchange rates updated successfully',
        count: exchangeRates.length,
        updated_at: new Date().toISOString()
      })
    
    if (logError) {
      console.error('Error logging update:', logError)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Exchange rates updated successfully',
        count: exchangeRates.length + 1, // +1 for TRY
        update_date: today
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Error in fetch-tcmb-rates function:', error)
    
    // Log error to exchange_rate_updates table
    await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'error',
        message: error.message || 'Unknown error',
        updated_at: new Date().toISOString()
      })
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
