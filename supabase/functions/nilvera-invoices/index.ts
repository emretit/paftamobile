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

    // Check for Nilvera authentication data (optional for now)
    const { data: nilveraAuth, error: authError } = await supabase
      .from('nilvera_auth')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // If no auth, we'll use mock data for now
    const useRealAPI = nilveraAuth && !authError;

    if (action === 'fetch_incoming') {
      if (useRealAPI) {
        // TODO: Make actual API calls to Nilvera to fetch incoming invoices
        console.log('Using real Nilvera API...');
      }
      
      // For now, check database first, then add some mock data if empty
      const { data: invoices, error: invoicesError } = await supabase
        .from('einvoices_received')
        .select('*')
        .order('created_at', { ascending: false });

      let transformedInvoices = [];
      
      if (invoices && invoices.length > 0) {
        // Transform database data to match expected format
        transformedInvoices = invoices.map(invoice => ({
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
      } else {
        // Add some mock data for demonstration
        transformedInvoices = [
          {
            id: 'mock-1',
            invoiceNumber: 'ABC2024000001',
            supplierName: 'Test Tedarikçi A.Ş.',
            supplierTaxNumber: '1234567890',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: null,
            totalAmount: 2500.00,
            paidAmount: 0,
            currency: 'TRY',
            taxAmount: 450.00,
            status: 'pending',
            responseStatus: 'pending',
            isAnswered: false,
            pdfUrl: null,
            xmlData: null
          },
          {
            id: 'mock-2',
            invoiceNumber: 'DEF2024000002',
            supplierName: 'Örnek Firma Ltd.',
            supplierTaxNumber: '0987654321',
            invoiceDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            dueDate: null,
            totalAmount: 1750.00,
            paidAmount: 0,
            currency: 'TRY',
            taxAmount: 315.00,
            status: 'approved',
            responseStatus: 'sent',
            isAnswered: true,
            pdfUrl: null,
            xmlData: null
          }
        ];
      }

      return new Response(JSON.stringify({ 
        success: true,
        invoices: transformedInvoices
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'fetch_earchive') {
      if (useRealAPI) {
        // TODO: Make actual API calls to Nilvera to fetch e-archive invoices
        console.log('Using real Nilvera API...');
      }
      
      // For now, check database first, then add some mock data if empty
      const { data: invoices, error: invoicesError } = await supabase
        .from('einvoices_sent')
        .select('*')
        .order('created_at', { ascending: false });

      let transformedInvoices = [];
      
      if (invoices && invoices.length > 0) {
        // Transform database data to match expected format
        transformedInvoices = invoices.map(invoice => ({
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
      } else {
        // Add some mock data for demonstration
        transformedInvoices = [
          {
            id: 'mock-sent-1',
            invoiceNumber: 'SF2024000001',
            customerName: 'ABC Müşteri Ltd.',
            customerTaxNumber: '5555555555',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: null,
            totalAmount: 3200.00,
            paidAmount: 3200.00,
            currency: 'TRY',
            taxAmount: 576.00,
            status: 'approved',
            statusCode: '1',
            sendType: 'electronic',
            isCancel: false,
            isReport: false,
            isRead: true,
            isPrint: false,
            isInternet: true,
            isTransfer: true,
            pdfUrl: null,
            xmlData: null
          },
          {
            id: 'mock-sent-2',
            invoiceNumber: 'SF2024000002',
            customerName: 'XYZ Şirketi A.Ş.',
            customerTaxNumber: '6666666666',
            invoiceDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            dueDate: null,
            totalAmount: 1850.00,
            paidAmount: 0,
            currency: 'TRY',
            taxAmount: 333.00,
            status: 'pending',
            statusCode: '0',
            sendType: 'electronic',
            isCancel: false,
            isReport: false,
            isRead: true,
            isPrint: false,
            isInternet: true,
            isTransfer: false,
            pdfUrl: null,
            xmlData: null
          }
        ];
      }

      return new Response(JSON.stringify({ 
        success: true,
        invoices: transformedInvoices
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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