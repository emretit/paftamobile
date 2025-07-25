import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-target-url, x-soap-action',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get request body
    const requestBody = await req.text();
    
    // Get target service URL from headers or use default
    const targetUrl = req.headers.get('x-target-url') || 'https://efaturatransfer.veriban.com.tr/IntegrationService.svc';
    const soapAction = req.headers.get('x-soap-action') || '';

    console.log('🔄 Proxying request to:', targetUrl);
    console.log('📤 SOAP Action:', soapAction);
    console.log('📝 Request Body Length:', requestBody.length);

    // Forward the request to Veriban API
    const veribanResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': soapAction,
        'User-Agent': 'Supabase-Edge-Function/1.0',
      },
      body: requestBody,
    });

    console.log('📥 Veriban Response Status:', veribanResponse.status);
    console.log('📥 Veriban Response Headers:', Object.fromEntries(veribanResponse.headers.entries()));

    // Get response body
    const responseBody = await veribanResponse.text();
    console.log('📄 Response Body Length:', responseBody.length);

    // Return the response with CORS headers
    return new Response(responseBody, {
      status: veribanResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/xml; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('❌ Proxy Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Proxy error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}); 