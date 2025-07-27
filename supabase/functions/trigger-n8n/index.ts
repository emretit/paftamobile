import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { workflow, user_id, parameters = {} } = await req.json()
    
    // Get auth header to validate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🚀 Triggering n8n workflow: ${workflow} for user: ${user_id}`)

    // Get n8n webhook URLs from environment
    const webhookUrls = {
      'fetch_daily_invoices': Deno.env.get('N8N_FETCH_INVOICES_WEBHOOK'),
      'sync_invoice_status': Deno.env.get('N8N_SYNC_STATUS_WEBHOOK'),
      'download_invoice_pdf': Deno.env.get('N8N_DOWNLOAD_PDF_WEBHOOK'),
      'send_notification': Deno.env.get('N8N_NOTIFICATION_WEBHOOK')
    }

    const webhookUrl = webhookUrls[workflow as keyof typeof webhookUrls]
    
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: `Unknown workflow: ${workflow}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare payload for n8n
    const payload = {
      user_id,
      timestamp: new Date().toISOString(),
      trigger_source: 'supabase',
      ...parameters
    }

    console.log(`📤 Sending to n8n:`, { webhookUrl, payload })

    // Trigger n8n workflow
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ n8n workflow failed:`, errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to trigger n8n workflow', 
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    console.log(`✅ n8n workflow triggered successfully:`, result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        workflow,
        triggered_at: new Date().toISOString(),
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error triggering n8n workflow:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})