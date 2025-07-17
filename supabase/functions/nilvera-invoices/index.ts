import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, invoice } = await req.json()

    // Get stored Nilvera token
    const { data: authData, error: authError } = await supabaseClient
      .from('nilvera_auth')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (authError || !authData) {
      throw new Error('Nilvera authentication not found')
    }

    // Check if token is expired
    if (new Date(authData.expires_at) < new Date()) {
      throw new Error('Nilvera token expired')
    }

    if (action === 'fetch_incoming') {
      // Fetch incoming invoices from Nilvera
      const response = await fetch('https://apitest.nilvera.com/einvoice/Purchase', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch invoices from Nilvera')
      }

      const invoices = await response.json()

      return new Response(
        JSON.stringify({ 
          success: true, 
          invoices: invoices.map((inv: any) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceSeriesNumber,
            supplierName: inv.senderTitle,
            supplierTaxNumber: inv.senderVKN,
            invoiceDate: inv.issueDate,
            dueDate: inv.paymentDate,
            totalAmount: parseFloat(inv.totalPayableAmount || 0),
            paidAmount: parseFloat(inv.paidAmount || 0),
            currency: inv.documentCurrencyCode || 'TRY',
            taxAmount: parseFloat(inv.totalTaxAmount || 0),
            status: inv.statusDescription,
            pdfUrl: inv.pdfUrl,
            xmlData: inv
          }))
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'create') {
      // Create invoice in Nilvera
      const invoiceData = {
        invoiceType: 'SATIS',
        invoiceSeriesNumber: invoice.invoiceNumber,
        issueDate: invoice.invoiceDate,
        senderTitle: 'NGS Teknoloji', // Your company name
        receiverTitle: invoice.supplierName,
        receiverVKN: invoice.supplierTaxNumber,
        documentCurrencyCode: invoice.currency,
        totalPayableAmount: invoice.totalAmount,
        totalTaxAmount: invoice.taxAmount,
        paymentDate: invoice.dueDate,
        note: invoice.description
      }

      const response = await fetch('https://apitest.nilvera.com/einvoice/Create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Nilvera create error:', errorData)
        throw new Error('Failed to create invoice in Nilvera')
      }

      const result = await response.json()

      return new Response(
        JSON.stringify({ 
          success: true, 
          invoiceId: result.id,
          message: 'Invoice created successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Nilvera invoices error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})