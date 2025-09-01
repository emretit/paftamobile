import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = 'https://vwhwufnckpqirxptwncw.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { action, filters } = await req.json();

    // Get the user's Nilvera authentication data
    const { data: nilveraAuth, error: authError } = await supabase
      .from('nilvera_auth')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (authError || !nilveraAuth) {
      throw new Error('Nilvera authentication not found. Please configure Nilvera settings first.');
    }

    if (action === 'fetch_incoming') {
      try {
        // Make actual API call to Nilvera to fetch incoming invoices
        const nilveraResponse = await fetch('https://efaturatest.nilvera.com/api/v1/einvoice/incoming', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraAuth.api_key}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!nilveraResponse.ok) {
          throw new Error(`Nilvera API error: ${nilveraResponse.status}`);
        }

        const nilveraData = await nilveraResponse.json();
        console.log('Nilvera incoming invoices response:', nilveraData);

        // Transform Nilvera data to our format
        const transformedInvoices = (nilveraData.data || []).map((invoice: any) => ({
          id: invoice.id || invoice.uuid,
          invoiceNumber: invoice.invoiceNumber || invoice.invoiceId,
          supplierName: invoice.supplierName || invoice.sender?.name,
          supplierTaxNumber: invoice.supplierTaxNumber || invoice.sender?.taxNumber,
          invoiceDate: invoice.issueDate || invoice.invoiceDate,
          dueDate: invoice.dueDate,
          totalAmount: parseFloat(invoice.totalAmount || invoice.amount || 0),
          paidAmount: parseFloat(invoice.paidAmount || 0),
          currency: invoice.currency || 'TRY',
          taxAmount: parseFloat(invoice.taxAmount || invoice.vatAmount || 0),
          status: invoice.status || 'pending',
          responseStatus: invoice.responseStatus || 'pending',
          isAnswered: invoice.isAnswered || false,
          pdfUrl: invoice.pdfUrl,
          xmlData: invoice.xmlContent || invoice.xmlData
        }));

        return new Response(JSON.stringify({ 
          success: true,
          invoices: transformedInvoices
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (apiError) {
        console.error('Nilvera API call failed:', apiError);
        
        // Fallback to database data if API fails
        const { data: invoices } = await supabase
          .from('einvoices_received')
          .select('*')
          .order('created_at', { ascending: false });

        const transformedInvoices = (invoices || []).map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoice_id || invoice.invoice_uuid,
          supplierName: invoice.supplier_name,
          supplierTaxNumber: invoice.supplier_vkn,
          invoiceDate: invoice.invoice_date,
          dueDate: null,
          totalAmount: invoice.total_amount || 0,
          paidAmount: 0,
          currency: invoice.currency || 'TRY',
          taxAmount: invoice.tax_amount || 0,
          status: invoice.invoice_state === 1 ? 'approved' : 'pending',
          responseStatus: invoice.response_sent ? 'sent' : 'pending',
          isAnswered: invoice.response_sent || false,
          pdfUrl: null,
          xmlData: invoice.xml_content ? JSON.parse(invoice.xml_content) : null
        }));

        return new Response(JSON.stringify({ 
          success: true,
          invoices: transformedInvoices,
          source: 'database_fallback',
          apiError: apiError.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'fetch_earchive') {
      try {
        // Make actual API call to Nilvera to fetch outgoing e-archive invoices
        const nilveraResponse = await fetch('https://efaturatest.nilvera.com/api/v1/earchive/outgoing', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraAuth.api_key}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!nilveraResponse.ok) {
          throw new Error(`Nilvera API error: ${nilveraResponse.status}`);
        }

        const nilveraData = await nilveraResponse.json();
        console.log('Nilvera e-archive invoices response:', nilveraData);

        // Transform Nilvera data to our format
        const transformedInvoices = (nilveraData.data || []).map((invoice: any) => ({
          id: invoice.id || invoice.uuid,
          invoiceNumber: invoice.invoiceNumber || invoice.invoiceId,
          customerName: invoice.customerName || invoice.receiver?.name,
          customerTaxNumber: invoice.customerTaxNumber || invoice.receiver?.taxNumber,
          invoiceDate: invoice.issueDate || invoice.invoiceDate,
          dueDate: invoice.dueDate,
          totalAmount: parseFloat(invoice.totalAmount || invoice.amount || 0),
          paidAmount: parseFloat(invoice.paidAmount || 0),
          currency: invoice.currency || 'TRY',
          taxAmount: parseFloat(invoice.taxAmount || invoice.vatAmount || 0),
          status: invoice.status || 'pending',
          statusCode: invoice.statusCode?.toString() || '0',
          sendType: invoice.sendType || 'electronic',
          isCancel: invoice.isCancel || false,
          isReport: invoice.isReport || false,
          isRead: invoice.isRead || true,
          isPrint: invoice.isPrint || false,
          isInternet: invoice.isInternet || true,
          isTransfer: invoice.isTransfer || false,
          pdfUrl: invoice.pdfUrl,
          xmlData: invoice.xmlContent || invoice.xmlData
        }));

        return new Response(JSON.stringify({ 
          success: true,
          invoices: transformedInvoices
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (apiError) {
        console.error('Nilvera API call failed:', apiError);
        
        // Fallback to database data if API fails
        const { data: invoices } = await supabase
          .from('einvoices_sent')
          .select('*')
          .order('created_at', { ascending: false });

        const transformedInvoices = (invoices || []).map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoice_id || invoice.invoice_uuid,
          customerName: invoice.customer_name,
          customerTaxNumber: invoice.customer_vkn,
          invoiceDate: invoice.invoice_date,
          dueDate: null,
          totalAmount: invoice.total_amount || 0,
          paidAmount: 0,
          currency: invoice.currency || 'TRY',
          taxAmount: invoice.tax_amount || 0,
          status: invoice.invoice_state === 1 ? 'approved' : 'pending',
          statusCode: invoice.transfer_state?.toString() || '0',
          sendType: 'electronic',
          isCancel: false,
          isReport: false,
          isRead: true,
          isPrint: false,
          isInternet: true,
          isTransfer: invoice.transfer_state === 1,
          pdfUrl: null,
          xmlData: invoice.xml_content ? JSON.parse(invoice.xml_content) : null
        }));

        return new Response(JSON.stringify({ 
          success: true,
          invoices: transformedInvoices,
          source: 'database_fallback',
          apiError: apiError.message
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in nilvera-invoices function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});