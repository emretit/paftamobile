
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
    console.log('🚀 Nilvera edge function started');
    
    const SUPABASE_URL = 'https://vwhwufnckpqirxptwncw.supabase.co';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('✅ Supabase client created');

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
    console.log('📨 Request body:', { action, filters });
    console.log('👤 User ID:', user.id);

    // Get user's company_id from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    console.log('🏢 Profile query result:', { profile, profileError });

    if (profileError || !profile?.company_id) {
      console.error('❌ User profile or company not found');
      throw new Error('User profile or company not found');
    }

    console.log('🏢 Company ID:', profile.company_id);

    // Get the company's Nilvera authentication data
    const { data: nilveraAuth, error: authError } = await supabase
      .from('nilvera_auth')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('is_active', true)
      .single();

    console.log('🔐 Nilvera auth query result:', { 
      hasAuth: !!nilveraAuth, 
      authError, 
      companyId: profile.company_id 
    });

    if (authError || !nilveraAuth) {
      console.error('❌ Nilvera authentication not found for company:', profile.company_id);
      throw new Error('Nilvera authentication not found for this company. Please configure Nilvera settings first.');
    }

    if (action === 'fetch_incoming') {
      try {
        console.log('🔄 Starting Nilvera API call for incoming invoices...');
        console.log('🔑 Using API key:', nilveraAuth.api_key ? `${nilveraAuth.api_key.substring(0, 8)}...` : 'MISSING');
        
        // Build query parameters - increase PageSize to get more invoices
        const queryParams = new URLSearchParams({
          Page: '1',
          PageSize: '100', // Increased from 50 to 100
          SortColumn: 'IssueDate',
          SortType: 'DESC',
          IsArchive: 'false'
        });
        
        // Add date filters - default to last 30 days if not provided
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDate = filters?.startDate || thirtyDaysAgo.toISOString().split('T')[0] + 'T00:00:00.000Z';
        const endDate = filters?.endDate || now.toISOString().split('T')[0] + 'T23:59:59.999Z';
        
        queryParams.append('StartDate', startDate);
        queryParams.append('EndDate', endDate);
        
        console.log('📅 Date filter:', { startDate, endDate });
        
        const apiUrl = `https://apitest.nilvera.com/einvoice/Purchase?${queryParams.toString()}`;
        console.log('🌐 Endpoint:', apiUrl);
        
        const nilveraResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraAuth.api_key}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('📡 API Response Status:', nilveraResponse.status);
        console.log('📡 API Response Headers:', Object.fromEntries(nilveraResponse.headers.entries()));

        if (!nilveraResponse.ok) {
          const errorText = await nilveraResponse.text();
          console.error('❌ API Error Response:', errorText);
          throw new Error(`Nilvera API error: ${nilveraResponse.status} - ${errorText}`);
        }

                            const nilveraData = await nilveraResponse.json();
                    console.log('✅ Nilvera API Response received');
                    console.log('📊 Pagination info:', {
                      Page: nilveraData.Page,
                      PageSize: nilveraData.PageSize,
                      TotalCount: nilveraData.TotalCount,
                      TotalPages: nilveraData.TotalPages,
                      ContentLength: nilveraData.Content?.length || 0
                    });
                    
                    // Log all unique sender names to see variety
                    const uniqueSenders = [...new Set(nilveraData.Content?.map(inv => inv.SenderName) || [])];
                    console.log('🏢 Unique sender companies found:', uniqueSenders);
                    console.log('📊 Total unique senders:', uniqueSenders.length);
                    
                    // Only log first invoice to avoid huge console output
                    if (nilveraData.Content?.length > 0) {
                      console.log('📄 First invoice sample:', nilveraData.Content[0]);
                    }

        // Transform Nilvera data to our format
        // Nilvera API returns { Page, PageSize, TotalCount, TotalPages, Content: [...] }
        const invoices = nilveraData.Content || [];
        console.log('📊 Raw invoices from API:', invoices.length);
        
        const transformedInvoices = invoices.map((invoice: any) => ({
          id: invoice.UUID,
          invoiceNumber: invoice.InvoiceNumber,
          supplierName: invoice.SenderName,
          supplierTaxNumber: invoice.SenderTaxNumber,
          invoiceDate: invoice.IssueDate,
          dueDate: null, // Nilvera API doesn't provide due date
          totalAmount: parseFloat(invoice.PayableAmount || 0),
          paidAmount: 0, // Not provided by Nilvera API
          currency: invoice.CurrencyCode || 'TRY',
          taxAmount: parseFloat(invoice.TaxTotalAmount || 0),
          status: invoice.StatusCode || 'pending',
          responseStatus: invoice.AnswerCode || 'pending',
          isAnswered: invoice.AnswerCode ? true : false,
          pdfUrl: null, // Would need separate API call
          xmlData: null, // Would need separate API call
          // Additional fields from Nilvera
          taxNumber: invoice.TaxNumber,
          invoiceProfile: invoice.InvoiceProfile,
          invoiceType: invoice.InvoiceType,
          taxExclusiveAmount: invoice.TaxExclusiveAmount,
          envelopeUUID: invoice.EnvelopeUUID,
          envelopeDate: invoice.EnvelopeDate,
          isRead: invoice.IsRead,
          isPrint: invoice.IsPrint,
          isArchive: invoice.IsArchive,
          isTransfer: invoice.IsTransfer,
          statusDetail: invoice.StatusDetail,
          createdDate: invoice.CreatedDate,
          tags: invoice.Tags || [],
          specialCode: invoice.SpecialCode,
          zirveStatus: invoice.ZirveStatus,
          luca: invoice.Luca
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
        console.log('🔄 Starting Nilvera API call for e-archive invoices...');
        
        // Build query parameters for e-archive
        const queryParams = new URLSearchParams({
          Page: '1',
          PageSize: '50',
          SortColumn: 'IssueDate',
          SortType: 'DESC'
        });
        
        // Add date filters - default to last 30 days if not provided
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const startDate = filters?.startDate || thirtyDaysAgo.toISOString().split('T')[0] + 'T00:00:00.000Z';
        const endDate = filters?.endDate || now.toISOString().split('T')[0] + 'T23:59:59.999Z';
        
        queryParams.append('StartDate', startDate);
        queryParams.append('EndDate', endDate);
        
        console.log('📅 E-archive date filter:', { startDate, endDate });
        
        const apiUrl = `https://apitest.nilvera.com/einvoice/Sale?${queryParams.toString()}`;
        console.log('🌐 E-archive Endpoint:', apiUrl);
        
        const nilveraResponse = await fetch(apiUrl, {
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