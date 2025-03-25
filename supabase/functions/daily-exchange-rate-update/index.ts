
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
    
    // Fetch from the fetch-exchange-rates function to update the rates
    const exchangeRatesUrl = 'https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/fetch-exchange-rates';
    
    // We want to create new rates, so use POST
    const response = await fetch(exchangeRatesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
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
