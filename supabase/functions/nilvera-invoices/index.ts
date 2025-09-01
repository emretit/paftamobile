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
      throw new Error('Nilvera authentication not found or inactive');
    }

    if (action === 'fetch_incoming') {
      // Here you would make actual API calls to Nilvera to fetch incoming invoices
      // For now, we'll return mock data from the database
      const { data: invoices, error: invoicesError } = await supabase
        .from('einvoices_received')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) {
        throw new Error('Failed to fetch incoming invoices from database');
      }

      // Transform database data to match expected format
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
        invoices: transformedInvoices
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'fetch_earchive') {
      // Here you would make actual API calls to Nilvera to fetch e-archive invoices
      // For now, we'll return mock data from the database
      const { data: invoices, error: invoicesError } = await supabase
        .from('einvoices_sent')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) {
        throw new Error('Failed to fetch e-archive invoices from database');
      }

      // Transform database data to match expected format
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