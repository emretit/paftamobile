
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TCMB_EVDS_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch today's exchange rates from TCMB EVDS API
    const currentDate = new Date().toISOString().split('T')[0];
    const apiUrl = `https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A-TP.DK.EUR.A-TP.DK.GBP.A&startDate=${currentDate}&endDate=${currentDate}&type=json&key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Extract and transform exchange rates
    const rates = {
      TRY: 1,
      USD: data.items[0].TP_DK_USD_A,
      EUR: data.items[0].TP_DK_EUR_A,
      GBP: data.items[0].TP_DK_GBP_A
    };

    return new Response(JSON.stringify(rates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch exchange rates' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
