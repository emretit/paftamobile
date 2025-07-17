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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
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
      throw new Error('Yetkilendirme gereklidir')
    }

    const { action, invoice } = await req.json()

    // Get stored Nilvera token
    const { data: authData, error: authError } = await supabaseClient
      .from('nilvera_auth')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (authError || !authData) {
      throw new Error('Nilvera kimlik doğrulama bilgisi bulunamadı. Lütfen önce Nilvera\'ya giriş yapın.')
    }

    // Check if token is expired
    if (new Date(authData.expires_at) < new Date()) {
      throw new Error('Nilvera oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
    }

    if (action === 'fetch_incoming') {
      console.log('Fetching incoming invoices from Nilvera...')
      console.log('Using token:', authData.access_token.substring(0, 10) + '...')
      
      // Doğru endpoint: gelen faturaları query parametreleri ile listele
      const now = new Date()
      const startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)) // Son 30 gün
      const endDate = now
      
      const queryParams = new URLSearchParams({
        'StartDate': startDate.toISOString(),
        'EndDate': endDate.toISOString(),
        'IsArchive': 'false',
        'Page': '1',
        'PageSize': '50',
        'SortColumn': 'IssueDate',
        'SortType': 'DESC'
      })
      
      // Fetch incoming invoices from Nilvera
      const response = await fetch(`https://apitest.nilvera.com/einvoice/Purchase?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Nilvera API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nilvera API error:', errorText)
        throw new Error(`Faturalar getirilemedi: ${response.status} - ${errorText}`)
      }
      
      const response_data = await response.json()
      console.log('Nilvera API response:', response_data)
      
      // Nilvera API response yapısını doğru şekilde parse et
      let invoices = []
      if (response_data && response_data.Content && Array.isArray(response_data.Content)) {
        invoices = response_data.Content
        console.log(`Found ${invoices.length} invoices in response`)
      } else {
        console.log('No Content array found in response:', response_data)
        invoices = []
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          invoices: invoices.map((inv: any) => ({
            id: inv.UUID,
            invoiceNumber: inv.InvoiceNumber,
            supplierName: inv.SenderName,
            supplierTaxNumber: inv.SenderTaxNumber,
            invoiceDate: inv.IssueDate,
            dueDate: inv.PaymentDate || null,
            totalAmount: parseFloat(inv.PayableAmount || 0),
            paidAmount: 0, // Gelen faturalar için ödenen tutar bilgisi genelde yoktur
            currency: inv.CurrencyCode || 'TRY',
            taxAmount: parseFloat(inv.TaxTotalAmount || 0),
            status: inv.StatusDetail,
            pdfUrl: null, // PDF URL ayrı bir API call ile alınır
            xmlData: inv
          }))
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'get_pdf') {
      const { invoiceId } = invoice
      
      if (!invoiceId) {
        throw new Error('Fatura ID gerekli')
      }

      console.log('Fetching PDF for invoice:', invoiceId)
      
      // Fetch PDF from Nilvera
      const response = await fetch(`https://apitest.nilvera.com/einvoice/Purchase/${invoiceId}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authData.access_token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nilvera PDF error:', errorText)
        throw new Error(`PDF getirilemedi: ${response.status} - ${errorText}`)
      }

      // PDF'i buffer olarak al
      const pdfBuffer = await response.arrayBuffer()
      const pdfBytes = new Uint8Array(pdfBuffer)
      
      // Supabase Storage'a yükle
      const fileName = `invoice-${invoiceId}-${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('invoices')
        .upload(fileName, pdfBytes, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error('PDF kaydedilemedi: ' + uploadError.message)
      }

      // Public URL'i al
      const { data: { publicUrl } } = supabaseClient.storage
        .from('invoices')
        .getPublicUrl(fileName)

      return new Response(
        JSON.stringify({ 
          success: true, 
          pdfUrl: publicUrl,
          message: 'PDF başarıyla yüklendi'
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
        throw new Error(`Fatura oluşturulamadı: ${response.status} - ${errorData}`)
      }

      const result = await response.json()

      return new Response(
        JSON.stringify({ 
          success: true, 
          invoiceId: result.id,
          message: 'Fatura başarıyla oluşturuldu'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Geçersiz işlem türü' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Nilvera invoices error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Bir hata oluştu' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})