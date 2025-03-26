
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Running daily exchange rate update");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the API key from environment variables
    const apiKey = Deno.env.get('TCMB_EVDS_API_KEY');
    if (!apiKey) {
      throw new Error('TCMB API key not configured');
    }

    // Fetch today's exchange rates from TCMB EVDS API
    const currentDate = new Date().toISOString().split('T')[0];
    const apiUrl = `https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A-TP.DK.EUR.A-TP.DK.GBP.A&startDate=${currentDate}&endDate=${currentDate}&type=json&key=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();

    // Check if we have valid data
    if (!data.items || data.items.length === 0) {
      throw new Error('No exchange rate data available');
    }

    // Extract and transform exchange rates
    const rates = {
      TRY: 1,
      USD: parseFloat(data.items[0].TP_DK_USD_A),
      EUR: parseFloat(data.items[0].TP_DK_EUR_A),
      GBP: parseFloat(data.items[0].TP_DK_GBP_A)
    };

    // First delete any existing entries for today to avoid duplicates
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
        forex_selling: rates.USD * 1.01,
        banknote_buying: rates.USD * 0.98,
        banknote_selling: rates.USD * 1.03,
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
      }
    ];

    const { error: insertError } = await supabase
      .from('exchange_rates')
      .insert(entries);

    if (insertError) {
      throw new Error(`Error storing exchange rates: ${insertError.message}`);
    }

    // Log the update to track successful operations
    await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'success',
        updated_at: new Date().toISOString(),
        message: 'Exchange rates updated successfully',
        count: entries.length
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Exchange rates updated successfully",
      updatedAt: currentDate,
      currencies: Object.keys(rates).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    
    // Log the error to the database
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
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
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
