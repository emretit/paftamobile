
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Enable REPLICA IDENTITY FULL for the exchange_rates table
    const { error: replicaError } = await supabase.rpc('execute_sql', {
      query: 'ALTER TABLE exchange_rates REPLICA IDENTITY FULL;'
    });

    if (replicaError) {
      throw new Error(`Failed to set REPLICA IDENTITY: ${replicaError.message}`);
    }

    // Enable the exchange_rates table for realtime
    const { error: realtimeError } = await supabase.rpc('execute_sql', {
      query: "BEGIN; " +
             "DROP PUBLICATION IF EXISTS supabase_realtime; " +
             "CREATE PUBLICATION supabase_realtime; " +
             "ALTER PUBLICATION supabase_realtime ADD TABLE exchange_rates; " +
             "COMMIT;"
    });

    if (realtimeError) {
      throw new Error(`Failed to set up realtime: ${realtimeError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Realtime enabled for exchange_rates table'
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error enabling realtime:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
