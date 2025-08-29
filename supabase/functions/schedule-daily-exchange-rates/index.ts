import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    console.log('Daily exchange rates scheduler triggered');
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Supabase environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Call the exchange-rates function
    const exchangeRatesResponse = await fetch(`${supabaseUrl}/functions/v1/exchange-rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!exchangeRatesResponse.ok) {
      const error = await exchangeRatesResponse.text();
      throw new Error(`Failed to fetch exchange rates: ${error}`);
    }

    const result = await exchangeRatesResponse.json();
    
    console.log('Daily exchange rates update completed:', result);

    // Log the scheduled update
    await fetch(`${supabaseUrl}/rest/v1/exchange_rate_updates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'scheduled_success',
        updated_at: new Date().toISOString(),
        message: `Scheduled update completed: ${result.count || 0} rates updated`,
        count: result.count || 0
      })
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily exchange rates update completed',
        result
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
    
  } catch (error) {
    console.error('Daily exchange rates scheduler error:', error);
    
    // Log the error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      await fetch(`${supabaseUrl}/rest/v1/exchange_rate_updates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'scheduled_error',
          updated_at: new Date().toISOString(),
          message: `Scheduled update failed: ${error.message}`,
          count: 0
        })
      });
    } catch (logError) {
      console.error('Failed to log scheduled error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Scheduled update failed' 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});
