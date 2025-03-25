
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
    console.log('Setting up exchange rate tracking tables...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Create SQL for setting up the exchange_rate_updates table
    const sql = `
      -- Create exchange_rate_updates table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.exchange_rate_updates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        message TEXT,
        count INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      -- Add comment to the table
      COMMENT ON TABLE public.exchange_rate_updates IS 'Tracks updates to exchange rates';
      
      -- Create an index on updated_at for faster queries
      CREATE INDEX IF NOT EXISTS idx_exchange_rate_updates_updated_at
      ON public.exchange_rate_updates (updated_at DESC);
      
      -- Return a message indicating success
      SELECT 'Exchange rate tracking tables created successfully' as message;
    `;
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('setup_exchange_rate_tracking', {}, {
      head: false,
      count: 'exact'
    });
    
    if (error) {
      // If the RPC doesn't exist or fails, fall back to direct SQL execution
      console.log('RPC failed, falling back to direct SQL execution');
      const { data: sqlData, error: sqlError } = await supabase.sql(sql);
      
      if (sqlError) {
        throw new Error(`Error setting up tracking tables: ${sqlError.message}`);
      }
      
      console.log('Tracking tables created via direct SQL');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Exchange rate tracking tables set up successfully via direct SQL',
          data: sqlData
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Exchange rate tracking tables set up successfully',
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
