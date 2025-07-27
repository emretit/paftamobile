import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, data, auth_token } = await req.json()

    // Simple auth validation - you should use a proper secret
    const expectedToken = Deno.env.get('N8N_WEBHOOK_SECRET')
    if (auth_token !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🔔 n8n webhook received: ${action}`)

    switch (action) {
      case 'invoice_batch_received': {
        // Process incoming invoices from n8n
        const { invoices, user_id } = data
        
        for (const invoice of invoices) {
          const { error } = await supabase
            .from('einvoices')
            .upsert({
              invoice_number: invoice.invoiceNumber,
              supplier_name: invoice.supplierName,
              supplier_tax_number: invoice.supplierTaxNumber,
              invoice_date: invoice.invoiceDate,
              due_date: invoice.dueDate,
              total_amount: invoice.totalAmount,
              tax_amount: invoice.taxAmount,
              currency: invoice.currency || 'TRY',
              status: invoice.status || 'received',
              xml_data: invoice.xmlData,
              pdf_url: invoice.pdfUrl,
              created_by: user_id,
              nilvera_id: invoice.nilveraId
            }, {
              onConflict: 'nilvera_id'
            })

          if (error) {
            console.error('Error inserting invoice:', error)
          }
        }

        console.log(`✅ Processed ${invoices.length} invoices`)
        
        return new Response(
          JSON.stringify({ success: true, processed: invoices.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'invoice_status_update': {
        const { invoice_id, status, user_id } = data
        
        const { error } = await supabase
          .from('einvoices')
          .update({ 
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('nilvera_id', invoice_id)
          .eq('created_by', user_id)

        if (error) {
          console.error('Error updating invoice status:', error)
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log(`✅ Updated invoice ${invoice_id} status to ${status}`)
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'sync_complete': {
        const { user_id, stats } = data
        
        // Log the sync completion
        console.log(`🔄 Sync completed for user ${user_id}:`, stats)
        
        // You could store sync stats in a separate table
        return new Response(
          JSON.stringify({ success: true, stats }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        console.log(`❓ Unknown action: ${action}`)
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('❌ n8n webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})