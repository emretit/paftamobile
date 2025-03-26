
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.2.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching exchange rates from TCMB...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    
    // Fetch data from TCMB
    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from TCMB: ${response.statusText}`)
    }
    
    const xmlData = await response.text()
    
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "_"
    })
    const result = parser.parse(xmlData)
    
    if (!result.Tarih_Date || !result.Tarih_Date.Currency) {
      throw new Error('Invalid XML format from TCMB')
    }

    // Add TRY as base currency
    const tryRate = {
      id: crypto.randomUUID(),
      currency_code: 'TRY',
      forex_buying: 1,
      forex_selling: 1,
      banknote_buying: 1,
      banknote_selling: 1,
      cross_rate: null,
      update_date: formattedDate
    }
    
    // Process currencies
    const currencies = Array.isArray(result.Tarih_Date.Currency) 
      ? result.Tarih_Date.Currency 
      : [result.Tarih_Date.Currency]
    
    const exchangeRates = currencies.map(currency => ({
      id: crypto.randomUUID(),
      currency_code: currency._CurrencyCode,
      forex_buying: parseFloat(currency.ForexBuying || 0) || null,
      forex_selling: parseFloat(currency.ForexSelling || 0) || null,
      banknote_buying: parseFloat(currency.BanknoteBuying || 0) || null,
      banknote_selling: parseFloat(currency.BanknoteSelling || 0) || null,
      cross_rate: parseFloat(currency.CrossRateOther || 0) || null,
      update_date: formattedDate
    }))
    
    // Add TRY to exchangeRates
    exchangeRates.push(tryRate)
    
    console.log(`Parsed ${exchangeRates.length} currencies from TCMB`)
    
    // Store in Supabase
    const { error: deleteError } = await supabase
      .from('exchange_rates')
      .delete()
      .eq('update_date', formattedDate)
    
    if (deleteError) {
      console.error('Error deleting existing rates:', deleteError)
    }
    
    const { data, error } = await supabase
      .from('exchange_rates')
      .upsert(exchangeRates)
      .select()
    
    if (error) {
      throw new Error(`Error inserting exchange rates: ${error.message}`)
    }
    
    // Record the update
    await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'success',
        count: exchangeRates.length,
        message: 'Updated from TCMB',
        updated_at: new Date().toISOString()
      })
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Exchange rates updated successfully',
        count: exchangeRates.length,
        rates: exchangeRates
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
    
    // Record the error
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'error',
        count: 0,
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
