

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
    console.log('📋 Request method:', req.method);
    console.log('📋 Request headers:', Object.fromEntries(req.headers.entries()));
    
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
      console.error('❌ Missing or invalid authorization header');
      throw new Error('Missing or invalid authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ Invalid user token:', userError);
      throw new Error('Invalid user token');
    }

    console.log('📨 Parsing request body...');
    const requestBody = await req.json();
    console.log('📨 Raw request body:', requestBody);
    
    const { action, filters, salesInvoiceId } = requestBody;
    console.log('📨 Parsed request body:', { action, filters, salesInvoiceId });
    console.log('👤 User ID:', user.id);

    // Validate required fields
    if (!action) {
      console.error('❌ Action is required');
      throw new Error('Action is required');
    }

    if (action === 'send_invoice' && !salesInvoiceId) {
      console.error('❌ salesInvoiceId is required for send_invoice action');
      throw new Error('salesInvoiceId is required for send_invoice action');
    }

    if (action === 'check_status' && !salesInvoiceId) {
      console.error('❌ salesInvoiceId is required for check_status action');
      throw new Error('salesInvoiceId is required for check_status action');
    }

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
      console.error('❌ Nilvera auth bulunamadı:', authError);
             throw new Error('Nilvera kimlik doğrulama bilgileri bulunamadı. Lütfen ayarlar sayfasından Nilvera bilgilerinizi girin.');
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
        
        // Add date filters - default to current month if not provided (max 6 months per Nilvera API)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const startDate = filters?.startDate || startOfMonth.toISOString().split('T')[0] + 'T00:00:00.000Z';
        const endDate = filters?.endDate || endOfMonth.toISOString().split('T')[0] + 'T23:59:59.999Z';
        
        queryParams.append('StartDate', startDate);
        queryParams.append('EndDate', endDate);
        
        console.log('📅 Date filter (current month):', { startDate, endDate });
        
        const apiUrl = `https://apitest.nilvera.com/einvoice/Purchase?${queryParams.toString()}`;
        console.log('🌐 Endpoint:', apiUrl);
        console.log('🔑 Full API Key (first 10 chars):', nilveraAuth.api_key?.substring(0, 10) + '...');
        
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
        console.error('❌ Nilvera API call failed:', apiError);
        console.error('❌ Error details:', {
          message: apiError.message,
          stack: apiError.stack,
          name: apiError.name
        });
        
        // Fallback to database data if API fails
        console.log('🔄 Falling back to database data...');
        const { data: invoices } = await supabase
          .from('einvoices_received')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('📊 Database fallback invoices:', invoices?.length || 0);

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
        
        // Add date filters - default to current month if not provided (max 6 months per Nilvera API)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const startDate = filters?.startDate || startOfMonth.toISOString().split('T')[0] + 'T00:00:00.000Z';
        const endDate = filters?.endDate || endOfMonth.toISOString().split('T')[0] + 'T23:59:59.999Z';
        
        queryParams.append('StartDate', startDate);
        queryParams.append('EndDate', endDate);
        
        console.log('📅 E-archive date filter (current month):', { startDate, endDate });
        
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

    if (action === 'send_invoice') {
      try {
        console.log('🚀 Starting e-invoice send process...');
        console.log('📊 Request data:', { action, salesInvoiceId, companyId: profile.company_id });
        
        if (!salesInvoiceId) {
          console.error('❌ salesInvoiceId is required');
          throw new Error('salesInvoiceId is required');
        }

        // Get sales invoice with items and company info
        console.log('📋 Fetching sales invoice:', { salesInvoiceId, companyId: profile.company_id });
        const { data: salesInvoice, error: invoiceError } = await supabase
          .from('sales_invoices')
          .select(`
            *,
            sales_invoice_items(*),
            customers(*),
            companies!sales_invoices_company_id_fkey(*)
          `)
          .eq('id', salesInvoiceId)
          .eq('company_id', profile.company_id)
          .single();

        if (invoiceError || !salesInvoice) {
          console.error('❌ Sales invoice not found:', {
            salesInvoiceId,
            companyId: profile.company_id,
            error: invoiceError
          });
          throw new Error(`Sales invoice not found: ${invoiceError?.message || 'Unknown error'}`);
        }

        console.log('📄 Sales invoice data:', {
          id: salesInvoice.id,
          fatura_no: salesInvoice.fatura_no,
          customer: salesInvoice.customers?.name,
          customer_tax_number: salesInvoice.customers?.tax_number,
          items: salesInvoice.sales_invoice_items?.length,
          company: salesInvoice.companies?.name
        });

        // Validate required customer data
        if (!salesInvoice.customers?.tax_number) {
          console.error('❌ Customer tax number is missing');
          throw new Error('Müşteri vergi numarası bulunamadı. Lütfen müşteri bilgilerini tamamlayın.');
        }

        // Validate required company data
        if (!salesInvoice.companies?.tax_number) {
          console.error('❌ Company tax number is missing');
          throw new Error('Şirket vergi numarası bulunamadı. Lütfen şirket bilgilerini tamamlayın.');
        }

        // Derive valid InvoiceSerieOrNumber per Nilvera docs
        const invoiceSerieOrNumber = (() => {
          const raw = (salesInvoice.fatura_no || '').toString();
          const cleaned = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          // If 16-char number like EFT2022000000001
          if (/^[A-Z]{3}[0-9]{13}$/.test(cleaned)) return cleaned;
          // If only series provided (first 3 letters)
          const letters = cleaned.replace(/[^A-Z]/g, '');
          if (letters.length >= 3) return letters.slice(0, 3);
          // Fallback default series
          return 'EFT';
        })();

        // Create standard Nilvera invoice model
        const nilveraInvoiceData = {
          EInvoice: {
            InvoiceInfo: {
              UUID: crypto.randomUUID ? crypto.randomUUID() : 'uuid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
              InvoiceType: 'SATIS',
              InvoiceSerieOrNumber: invoiceSerieOrNumber,
              IssueDate: new Date(salesInvoice.fatura_tarihi).toISOString(),
              CurrencyCode: salesInvoice.para_birimi || 'TRY',
              ExchangeRate: 1,
              InvoiceProfile: 'TICARIFATURA'
            },
            CompanyInfo: {
              TaxNumber: salesInvoice.companies?.tax_number,
              Name: salesInvoice.companies?.name || 'Şirket Adı',
              Address: salesInvoice.companies?.address || 'Şirket Adresi',
              District: 'Merkez',
              City: 'İstanbul', // Default şehir
              Country: 'Türkiye',
              Phone: salesInvoice.companies?.phone || '',
              Mail: salesInvoice.companies?.email || ''
            },
            CustomerInfo: {
              TaxNumber: salesInvoice.customers?.tax_number,
              Name: salesInvoice.customers?.name || salesInvoice.customers?.company,
              TaxOffice: salesInvoice.customers?.tax_office,
              Address: salesInvoice.customers?.address || '-',
              District: salesInvoice.customers?.district || salesInvoice.customers?.city || 'Merkez',
              City: salesInvoice.customers?.city || 'İstanbul',
              Country: 'Türkiye',
              Phone: salesInvoice.customers?.mobile_phone || salesInvoice.customers?.office_phone || '',
              Mail: salesInvoice.customers?.email || ''
            },
            InvoiceLines: salesInvoice.sales_invoice_items?.map((item: any) => ({
              Name: item.urun_adi,
              Description: item.aciklama || '',
              Quantity: parseFloat(item.miktar),
              UnitType: item.birim === 'adet' ? 'C62' : 'C62', // UBL-TR standart birim kodları
              Price: parseFloat(item.birim_fiyat),
              KDVPercent: parseFloat(item.kdv_orani),
              DiscountPercent: parseFloat(item.indirim_orani || 0),
              LineTotal: parseFloat(item.satir_toplami)
            })) || [],
            Notes: salesInvoice.notlar ? [salesInvoice.notlar] : []
          }
          // CustomerAlias will be set below based on requirements
        };

        // CustomerAlias is REQUIRED for e-fatura mükellefi customers
        // First try to get alias from local DB
        const { data: aliasRow } = await supabase
          .from('customer_aliases')
          .select('alias_name')
          .eq('company_id', profile.company_id)
          .eq('vkn', salesInvoice.customers?.tax_number)
          .maybeSingle();

        if (aliasRow?.alias_name) {
          console.log('📝 Found customer alias in DB:', aliasRow.alias_name);
          // Verify alias is still valid in Nilvera system before using
          console.log('🔍 Verifying alias validity in Nilvera system...');
          const globalCompanyUrl = nilveraAuth.test_mode 
            ? 'https://apitest.nilvera.com/general/GlobalCompany'
            : 'https://api.nilvera.com/general/GlobalCompany';

          try {
            const globalCompanyResponse = await fetch(`${globalCompanyUrl}?VKN=${salesInvoice.customers?.tax_number}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${nilveraAuth.api_key}`,
                'Content-Type': 'application/json'
              }
            });

            if (globalCompanyResponse.ok) {
              const globalCompanyData = await globalCompanyResponse.json();
              if (globalCompanyData.AliasName === aliasRow.alias_name) {
                console.log('✅ DB alias is still valid in Nilvera system');
                // CustomerAlias must be in URN format: "urn:mail:email@domain.com"
                nilveraInvoiceData.CustomerAlias = `urn:mail:${salesInvoice.customers?.email || 'customer@example.com'}`;
              } else {
                console.log('⚠️ DB alias is outdated, using Nilvera system alias:', globalCompanyData.AliasName);
                // CustomerAlias must be in URN format: "urn:mail:email@domain.com"
                nilveraInvoiceData.CustomerAlias = `urn:mail:${salesInvoice.customers?.email || 'customer@example.com'}`;
                
                // Update DB with current alias
                await supabase
                  .from('customer_aliases')
                  .update({
                    alias_name: globalCompanyData.AliasName,
                    company_name: salesInvoice.customers?.name,
                    updated_at: new Date().toISOString()
                  })
                  .eq('company_id', profile.company_id)
                  .eq('vkn', salesInvoice.customers?.tax_number);
              }
            } else {
              console.log('⚠️ Customer not found in Nilvera system, removing from DB');
              await supabase
                .from('customer_aliases')
                .delete()
                .eq('company_id', profile.company_id)
                .eq('vkn', salesInvoice.customers?.tax_number);
              delete nilveraInvoiceData.CustomerAlias;
            }
          } catch (globalCompanyError) {
            console.error('❌ Alias verification failed:', globalCompanyError.message);
            // If verification fails, don't use the alias
            delete nilveraInvoiceData.CustomerAlias;
          }
        } else {
          // Check if customer is e-fatura mükellefi and get their alias from Nilvera
          console.log('🔍 Checking customer e-fatura mükellefi status:', salesInvoice.customers?.tax_number);
          const globalCompanyUrl = nilveraAuth.test_mode 
            ? 'https://apitest.nilvera.com/general/GlobalCompany'
            : 'https://api.nilvera.com/general/GlobalCompany';

          try {
            const globalCompanyResponse = await fetch(`${globalCompanyUrl}?VKN=${salesInvoice.customers?.tax_number}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${nilveraAuth.api_key}`,
                'Content-Type': 'application/json'
              }
            });

            if (globalCompanyResponse.ok) {
              const globalCompanyData = await globalCompanyResponse.json();
              console.log('✅ Customer e-fatura mükellefi found:', globalCompanyData);
              
              if (globalCompanyData.AliasName) {
                console.log('📝 Using Nilvera system alias:', globalCompanyData.AliasName);
                // CustomerAlias must be in URN format: "urn:mail:email@domain.com"
                nilveraInvoiceData.CustomerAlias = `urn:mail:${salesInvoice.customers?.email || 'customer@example.com'}`;
                
                // Save alias to local DB for future use
                await supabase
                  .from('customer_aliases')
                  .upsert({
                    company_id: profile.company_id,
                    vkn: salesInvoice.customers?.tax_number,
                    alias_name: globalCompanyData.AliasName,
                    company_name: salesInvoice.customers?.name,
                    updated_at: new Date().toISOString()
                  });
              } else {
                console.log('⚠️ Customer is e-fatura mükellefi but has no alias');
                throw new Error(`Müşteri e-fatura mükellefi ancak takma adı bulunamadı. VKN: ${salesInvoice.customers?.tax_number}`);
              }
            } else {
              console.log('ℹ️ Customer not found in e-fatura mükellefi list - treating as paper invoice');
              // For non-e-fatura customers, CustomerAlias should be omitted from the request
              // Remove the CustomerAlias field entirely
              delete nilveraInvoiceData.CustomerAlias;
            }
          } catch (globalCompanyError) {
            console.error('❌ GlobalCompany check failed:', globalCompanyError.message);
            // If we can't check, assume it's a paper invoice customer
            delete nilveraInvoiceData.CustomerAlias;
          }
        }

        console.log('📋 Nilvera invoice model created:', {
          invoiceNumber: nilveraInvoiceData.EInvoice.InvoiceInfo.InvoiceSerieOrNumber,
          customer: nilveraInvoiceData.EInvoice.CustomerInfo.Name,
          customerAlias: nilveraInvoiceData.CustomerAlias || 'N/A',
          total: salesInvoice.toplam_tutar
        });

        // Send to Nilvera API - using Model endpoint for standard format
        const nilveraApiUrl = nilveraAuth.test_mode 
          ? 'https://apitest.nilvera.com/einvoice/Send/Model'
          : 'https://api.nilvera.com/einvoice/Send/Model';

        console.log('🌐 Sending to Nilvera API:', nilveraApiUrl);

        const nilveraResponse = await fetch(nilveraApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${nilveraAuth.api_key}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(nilveraInvoiceData)
        });

        console.log('📡 Nilvera API response status:', nilveraResponse.status);

        if (!nilveraResponse.ok) {
          const errorText = await nilveraResponse.text();
          console.error('❌ Nilvera API error:', errorText);
          throw new Error(`Nilvera API error: ${nilveraResponse.status} - ${errorText}`);
        }

        const nilveraResult = await nilveraResponse.json();
        console.log('✅ Nilvera draft created:', nilveraResult);

        // Save to tracking table
        const { error: trackingError } = await supabase
          .from('einvoice_status_tracking')
          .insert({
            company_id: profile.company_id,
            sales_invoice_id: salesInvoiceId,
            nilvera_invoice_id: nilveraResult.id || nilveraResult.uuid,
            nilvera_transfer_id: nilveraResult.transferId,
            status: 'sent',
            transfer_state: nilveraResult.transferState || 0,
            invoice_state: nilveraResult.invoiceState || 0,
            sent_at: new Date().toISOString(),
            nilvera_response: nilveraResult
          });

        if (trackingError) {
          console.error('❌ Error saving tracking data:', trackingError);
        }

        // Update sales invoice status
        const { error: updateError } = await supabase
          .from('sales_invoices')
          .update({ 
            durum: 'gonderildi',
            xml_data: nilveraResult
          })
          .eq('id', salesInvoiceId);

        if (updateError) {
          console.error('❌ Error updating sales invoice:', updateError);
        }

        return new Response(JSON.stringify({ 
          success: true,
          message: 'E-fatura başarıyla Nilvera\'ya gönderildi',
          nilveraInvoiceId: nilveraResult.id || nilveraResult.uuid,
          data: nilveraResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('❌ Send invoice error:', error);
        
        // Log error to database
        await supabase
          .from('einvoice_status_tracking')
          .insert({
            company_id: profile.company_id,
            sales_invoice_id: salesInvoiceId,
            status: 'error',
            error_message: error.message,
            error_code: 'SEND_ERROR'
          });

        return new Response(JSON.stringify({ 
          success: false,
          error: error.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (action === 'check_status') {
      try {
        console.log('🔍 Checking invoice status...');
        
        if (!salesInvoiceId) {
          throw new Error('salesInvoiceId is required');
        }

        // Get tracking record
        const { data: tracking, error: trackingError } = await supabase
          .from('einvoice_status_tracking')
          .select('*')
          .eq('sales_invoice_id', salesInvoiceId)
          .eq('company_id', profile.company_id)
          .single();

        if (trackingError || !tracking) {
          throw new Error('Tracking record not found');
        }

        if (!tracking.nilvera_invoice_id) {
          throw new Error('Nilvera invoice ID not found');
        }

        // Get Nilvera auth settings
        const { data: nilveraAuth, error: authError } = await supabase
          .from('nilvera_auth')
          .select('*')
          .eq('company_id', profile.company_id)
          .single();

        if (authError || !nilveraAuth) {
          throw new Error('Nilvera API ayarları bulunamadı. Lütfen önce API anahtarlarınızı ayarlayın.');
        }

        // Check status from Nilvera API
        const statusApiUrl = nilveraAuth.test_mode 
          ? `https://apitest.nilvera.com/einvoice/Status/${tracking.nilvera_invoice_id}`
          : `https://api.nilvera.com/einvoice/Status/${tracking.nilvera_invoice_id}`;

        console.log('🌐 Checking status at:', statusApiUrl);

        const statusResponse = await fetch(statusApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraAuth.api_key}`,
            'Content-Type': 'application/json'
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        console.log('📊 Status check result:', statusData);

        // Update tracking record
        const { error: updateError } = await supabase
          .from('einvoice_status_tracking')
          .update({
            transfer_state: statusData.transferState,
            invoice_state: statusData.invoiceState,
            answer_type: statusData.answerType,
            status: statusData.status || tracking.status,
            delivered_at: statusData.deliveredAt ? new Date(statusData.deliveredAt).toISOString() : null,
            responded_at: statusData.respondedAt ? new Date(statusData.respondedAt).toISOString() : null,
            nilvera_response: statusData,
            updated_at: new Date().toISOString()
          })
          .eq('id', tracking.id);

        if (updateError) {
          console.error('❌ Error updating tracking:', updateError);
        }

        return new Response(JSON.stringify({ 
          success: true,
          status: statusData.status,
          data: statusData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('❌ Status check error:', error);
        
        return new Response(JSON.stringify({ 
          success: false,
          error: error.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('❌ Error in nilvera-invoices function:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unknown error occurred',
      errorType: error.name || 'UnknownError',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
