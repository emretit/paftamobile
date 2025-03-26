
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TCMB_EVDS_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch today's exchange rates from TCMB EVDS API with more currencies
    const currentDate = new Date().toISOString().split('T')[0];
    // Format: YYYY-MM-DD to DD-MM-YYYY for TCMB API
    const formattedDate = currentDate.split('-').reverse().join('-');
    
    // Using expanded currency list as requested
    const apiUrl = `https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A-TP.DK.EUR.A-TP.DK.CHF.A-TP.DK.GBP.A-TP.DK.JPY.A&startDate=${formattedDate}&endDate=${formattedDate}&type=json&key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Check if we have items in the response
    if (!data.items || data.items.length === 0) {
      return new Response(JSON.stringify({ error: 'No exchange rate data available' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract and transform exchange rates
    const rates = {
      TRY: 1,
      USD: parseFloat(data.items[0].TP_DK_USD_A),
      EUR: parseFloat(data.items[0].TP_DK_EUR_A),
      GBP: parseFloat(data.items[0].TP_DK_GBP_A),
      CHF: parseFloat(data.items[0].TP_DK_CHF_A),
      JPY: parseFloat(data.items[0].TP_DK_JPY_A)
    };

    // Store rates in the database
    // First, delete any existing entries for today to avoid duplicates
    await supabase
      .from('exchange_rates')
      .delete()
      .eq('update_date', currentDate);

    // Insert new entries
    const entries = [
      {
        currency_code: 'TRY',
        forex_buying: 1,
        forex_selling: 1,
        banknote_buying: 1,
        banknote_selling: 1,
        cross_rate: null,
        update_date: currentDate
      },
      {
        currency_code: 'USD',
        forex_buying: rates.USD,
        forex_selling: rates.USD * 1.01, // Example markup for selling rate
        banknote_buying: rates.USD * 0.98, // Example discount for cash buying
        banknote_selling: rates.USD * 1.03, // Example markup for cash selling
        cross_rate: 1,
        update_date: currentDate
      },
      {
        currency_code: 'EUR',
        forex_buying: rates.EUR,
        forex_selling: rates.EUR * 1.01,
        banknote_buying: rates.EUR * 0.98,
        banknote_selling: rates.EUR * 1.03,
        cross_rate: rates.EUR / rates.USD,
        update_date: currentDate
      },
      {
        currency_code: 'GBP',
        forex_buying: rates.GBP,
        forex_selling: rates.GBP * 1.01,
        banknote_buying: rates.GBP * 0.98,
        banknote_selling: rates.GBP * 1.03,
        cross_rate: rates.GBP / rates.USD,
        update_date: currentDate
      },
      {
        currency_code: 'CHF',
        forex_buying: rates.CHF,
        forex_selling: rates.CHF * 1.01,
        banknote_buying: rates.CHF * 0.98,
        banknote_selling: rates.CHF * 1.03,
        cross_rate: rates.CHF / rates.USD,
        update_date: currentDate
      },
      {
        currency_code: 'JPY',
        forex_buying: rates.JPY,
        forex_selling: rates.JPY * 1.01,
        banknote_buying: rates.JPY * 0.98,
        banknote_selling: rates.JPY * 1.03,
        cross_rate: rates.JPY / rates.USD,
        update_date: currentDate
      }
    ];

    const { error: insertError } = await supabase
      .from('exchange_rates')
      .insert(entries);

    if (insertError) {
      console.error('Error storing exchange rates:', insertError);
    }

    return new Response(JSON.stringify(rates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch exchange rates' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
