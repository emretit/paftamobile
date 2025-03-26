
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.3'

// CORS headers
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
    console.log('Setting up daily exchange rate schedule...');
    
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    
    // Check if necessary tables exist
    const { error: tableError } = await supabase
      .from('exchange_rates')
      .select('id')
      .limit(1);
      
    if (tableError) {
      console.error('Error accessing exchange_rates table:', tableError);
      throw new Error(`Exchange rates table error: ${tableError.message}`);
    }
    
    // Check if the cron function exists
    const { data: functionExists, error: functionError } = await supabase
      .rpc('setup_exchange_rate_cron')
      .catch(() => ({ data: null, error: { message: 'Function does not exist' } }));
      
    if (functionError && functionError.message !== 'Function does not exist') {
      console.error('Error checking for cron function:', functionError);
    }
    
    let result;
    
    if (functionError && functionError.message === 'Function does not exist') {
      // Create the function if it doesn't exist
      const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION setup_exchange_rate_cron()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Schedule the function to run at 16:00 every day
        PERFORM cron.schedule(
          'daily-exchange-rate-update',  -- job name
          '0 16 * * *',                 -- cron schedule (16:00 daily)
          'SELECT net.http_post(
            url:=''https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/exchange-rates'',
            headers:=''{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aHd1Zm5ja3BxaXJ4cHR3bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODI5MjAsImV4cCI6MjA1NDk1ODkyMH0.Wjw8MAnsBrHxB6-J-bNGObgDQ4fl3zPYrgYI5tOrcKo"}''::jsonb,
            body:=''{}''::jsonb
          ) AS request_id;'
        );
      END;
      $$;
      `;
      
      const { error: createError } = await supabase.rpc('ensure_cron_job_enabled');
      if (createError) {
        console.error('Error enabling cron extension:', createError);
      }
      
      const { error: sqlError } = await supabase.rpc('run_sql_query', { query: createFunctionSQL });
      if (sqlError) {
        console.error('Error creating function:', sqlError);
        throw new Error(`Failed to create cron function: ${sqlError.message}`);
      }
      
      // Now call the function
      result = await supabase.rpc('setup_exchange_rate_cron');
    } else {
      // Call the existing function
      result = await supabase.rpc('setup_exchange_rate_cron');
    }
    
    // Log setup operation to exchange_rate_updates
    try {
      await supabase
        .from('exchange_rate_updates')
        .insert({
          status: result && result.error ? 'error' : 'success',
          message: result && result.error 
            ? `Failed to set up cron job: ${result.error.message}` 
            : 'Daily exchange rate update scheduled successfully',
          updated_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Could not log to exchange_rate_updates:', logError);
    }
    
    // Manually trigger an immediate exchange rate update
    console.log('Triggering immediate exchange rate update...');
    const { data: updateResult, error: updateError } = await supabase.functions.invoke('exchange-rates', {
      method: 'POST'
    });
    
    if (updateError) {
      console.error('Error triggering immediate update:', updateError);
    } else {
      console.log('Immediate update triggered successfully:', updateResult);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily exchange rate schedule set up successfully',
        immediate_update: updateError ? { success: false, error: updateError.message } : { success: true }
      }),
      { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error('Error setting up exchange rate schedule:', error);
    
    // Log error to exchange_rate_updates
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false }
        });
        
        await supabase
          .from('exchange_rate_updates')
          .insert({
            status: 'error',
            message: `Error setting up schedule: ${error.message}`,
            updated_at: new Date().toISOString()
          });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error setting up exchange rate schedule',
        error: error.message
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
