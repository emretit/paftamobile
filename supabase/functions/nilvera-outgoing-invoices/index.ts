import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NilveraInvoiceResponse {
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
  Content: Array<{
    UUID: string;
    TaxNumber: string;
    ReceiverTaxNumber: string;
    ReceiverName: string;
    InvoiceNumber: string;
    InvoiceProfile: string;
    InvoiceType: string;
    IssueDate: string;
    CurrencyCode: string;
    PayableAmount: number;
    TaxExclusiveAmount: number;
    TaxTotalAmount: number;
    LineExtensionAmount: number;
    ExchangeRate: number;
    AllowanceTotalAmount: number;
    ChargeTotalAmount: number;
    IsRead: boolean;
    IsPrint: boolean;
    IsArchive: boolean;
    IsTransfer: boolean;
    ZirveStatus: boolean;
    CreatedDate: string;
    StatusCode: string;
    StatusDetail: string;
    AnswerCode: string;
    EnvelopeUUID: string;
    EnvelopeDate: string;
    Email: string;
    Tags: Array<{
      UUID: string;
      Description: string;
      Name: string;
      Color: string;
    }>;
    SpecialCode: string;
    Luca: {
      Status: string;
      Description: string;
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, params = {} } = await req.json()
    const nilveraApiKey = Deno.env.get('NILVERA_API_KEY')

    if (!nilveraApiKey) {
      throw new Error('NILVERA_API_KEY environment variable is not set')
    }

    switch (action) {
      case 'fetch_outgoing': {
        // Giden faturaları Nilvera API'den çek
        const queryParams = new URLSearchParams({
          PageSize: (params.pageSize || 100).toString(),
          Page: (params.page || 1).toString(),
          ...(params.search && { Search: params.search }),
          ...(params.startDate && { StartDate: params.startDate }),
          ...(params.endDate && { EndDate: params.endDate }),
          ...(params.sortColumn && { SortColumn: params.sortColumn }),
          ...(params.sortType && { SortType: params.sortType }),
          ...(params.isRead !== undefined && { IsRead: params.isRead.toString() }),
          ...(params.isPrint !== undefined && { IsPrint: params.isPrint.toString() }),
          ...(params.isArchive !== undefined && { IsArchive: params.isArchive.toString() }),
          ...(params.isTransfer !== undefined && { IsTransfer: params.isTransfer.toString() }),
        })

        const response = await fetch(`https://api.nilvera.com/einvoice/Sale?${queryParams}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraApiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Nilvera API error: ${response.status} ${response.statusText}`)
        }

        const data: NilveraInvoiceResponse = await response.json()

        // Transform Nilvera data to our format
        const transformedInvoices = data.Content.map(invoice => ({
          id: invoice.UUID,
          invoiceNumber: invoice.InvoiceNumber,
          customerName: invoice.ReceiverName,
          customerTaxNumber: invoice.ReceiverTaxNumber,
          invoiceDate: invoice.IssueDate,
          dueDate: null, // Nilvera response doesn't include due date in list
          totalAmount: invoice.PayableAmount,
          paidAmount: 0, // This would need to be calculated separately
          currency: invoice.CurrencyCode,
          taxAmount: invoice.TaxTotalAmount,
          status: invoice.StatusCode,
          statusDetail: invoice.StatusDetail,
          answerCode: invoice.AnswerCode,
          pdfUrl: null, // PDF URL would be fetched separately
          xmlData: null, // XML data would be fetched separately
          isRead: invoice.IsRead,
          isPrint: invoice.IsPrint,
          isArchive: invoice.IsArchive,
          isTransfer: invoice.IsTransfer,
          createdDate: invoice.CreatedDate,
          envelopeUUID: invoice.EnvelopeUUID,
          envelopeDate: invoice.EnvelopeDate,
          email: invoice.Email,
          tags: invoice.Tags,
          specialCode: invoice.SpecialCode,
          lucaStatus: invoice.Luca,
          invoiceProfile: invoice.InvoiceProfile,
          invoiceType: invoice.InvoiceType,
          exchangeRate: invoice.ExchangeRate,
          taxExclusiveAmount: invoice.TaxExclusiveAmount,
          lineExtensionAmount: invoice.LineExtensionAmount,
          allowanceTotalAmount: invoice.AllowanceTotalAmount,
          chargeTotalAmount: invoice.ChargeTotalAmount,
        }))

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              invoices: transformedInvoices,
              pagination: {
                page: data.Page,
                pageSize: data.PageSize,
                totalCount: data.TotalCount,
                totalPages: data.TotalPages,
              }
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'get_invoice_pdf': {
        const { uuid } = params
        if (!uuid) {
          throw new Error('UUID parameter is required')
        }

        const response = await fetch(`https://api.nilvera.com/einvoice/Sale/${uuid}/pdf`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraApiKey}`,
            'Accept': 'application/pdf',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
        }

        const pdfBlob = await response.blob()
        
        return new Response(pdfBlob, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${uuid}.pdf"`
          }
        })
      }

      case 'get_invoice_xml': {
        const { uuid } = params
        if (!uuid) {
          throw new Error('UUID parameter is required')
        }

        const response = await fetch(`https://api.nilvera.com/einvoice/Sale/${uuid}/xml`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraApiKey}`,
            'Accept': 'application/xml',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch XML: ${response.status} ${response.statusText}`)
        }

        const xmlData = await response.text()
        
        return new Response(
          JSON.stringify({
            success: true,
            data: { xmlData }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      case 'get_invoice_details': {
        const { uuid } = params
        if (!uuid) {
          throw new Error('UUID parameter is required')
        }

        const response = await fetch(`https://api.nilvera.com/einvoice/Sale/${uuid}/details`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraApiKey}`,
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch invoice details: ${response.status} ${response.statusText}`)
        }

        const details = await response.json()
        
        return new Response(
          JSON.stringify({
            success: true,
            data: details
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Error in nilvera-outgoing-invoices function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})