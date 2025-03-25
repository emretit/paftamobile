
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Starting daily exchange rate update...');
    
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    // Fetch from the fetch-exchange-rates function to update the rates
    const exchangeRatesUrl = `${supabaseUrl}/functions/v1/fetch-exchange-rates`;
    
    // We want to create new rates, so use POST
    const response = await fetch(exchangeRatesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        ...corsHeaders
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Also update a status record in our database to track the last update
    await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'success',
        updated_at: new Date().toISOString(),
        message: 'Exchange rates updated successfully',
        count: result.count || 0
      })
      .select();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily exchange rate update completed successfully',
        result
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error in daily exchange rate update:', error);
    
    // Try to log the error in the database
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
      
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      
      await supabase
        .from('exchange_rate_updates')
        .insert({
          status: 'error',
          updated_at: new Date().toISOString(),
          message: `Error: ${error.message}`
        })
        .select();
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error during daily exchange rate update',
        error: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
