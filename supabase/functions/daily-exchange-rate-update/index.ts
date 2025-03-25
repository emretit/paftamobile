
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
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    // Fetch exchange rates from TCMB
    console.log('Calling fetch-exchange-rates to update rates from TCMB...');
    
    // We want to create new rates, so use POST
    const response = await fetch(`${supabaseUrl}/functions/v1/fetch-exchange-rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        ...corsHeaders
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Exchange rates fetched successfully:', result);
    
    // Create an update record to track the last update
    const { data: updateRecord, error: updateError } = await supabase
      .from('exchange_rate_updates')
      .insert({
        status: 'success',
        updated_at: new Date().toISOString(),
        message: 'Exchange rates updated successfully from TCMB',
        count: result.count || 0
      })
      .select();
      
    if (updateError) {
      console.warn('Could not record update status:', updateError);
    } else {
      console.log('Update status recorded:', updateRecord);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily exchange rate update completed successfully',
        updated_at: new Date().toISOString(),
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
      
      if (supabaseUrl && supabaseKey) {
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
      }
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error during daily exchange rate update',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
