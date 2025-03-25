
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
    console.log('Setting up exchange rate tracking table...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Execute SQL to create the tracking table if not exists
    const { data, error } = await supabase.rpc('setup_exchange_rate_tracking');
    
    if (error) {
      throw new Error(`Error setting up tracking table: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Exchange rate tracking table set up successfully',
        data
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error setting up exchange rate tracking:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error setting up exchange rate tracking',
        error: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
