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
    console.log('🚀 Nilvera send invoice function started');
    console.log('📋 Request method:', req.method);
    
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
    
    const { salesInvoiceId } = requestBody;
    console.log('📨 Parsed request body:', { salesInvoiceId });
    console.log('👤 User ID:', user.id);

    // Validate required fields
    if (!salesInvoiceId) {
      console.error('❌ salesInvoiceId is required');
      throw new Error('salesInvoiceId is required');
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

    // Send invoice to Nilvera
    try {
      console.log('🚀 Starting e-invoice send process...');
      console.log('📊 Request data:', { salesInvoiceId, companyId: profile.company_id });
      
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
      const nilveraInvoiceData: any = {
        EInvoice: {
          InvoiceInfo: {
            UUID: crypto.randomUUID ? crypto.randomUUID() : 'uuid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            InvoiceType: 'SATIS',
            InvoiceSerieOrNumber: invoiceSerieOrNumber,
            IssueDate: new Date(salesInvoice.fatura_tarihi).toISOString(),
            CurrencyCode: salesInvoice.para_birimi || 'TRY',
            ExchangeRate: 1,
                          InvoiceProfile: 'TEMELFATURA' // Will be changed to TICARIFATURA if e-fatura mükellefi
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
        // CustomerAlias will be set below only for e-fatura mükellefi customers
      };

              // CustomerAlias is REQUIRED for e-fatura mükellefi customers
        // Only check for alias if customer is e-fatura mükellefi
        let customerAlias = null;
        
        if (salesInvoice.customers?.is_einvoice_mukellef) {
          customerAlias = salesInvoice.customers?.einvoice_alias_name;
          
          // Clean and validate alias from customer table
          if (customerAlias) {
            customerAlias = customerAlias.toString().trim();
            if (customerAlias === 'undefined' || customerAlias === 'null' || customerAlias === '') {
              customerAlias = null;
            }
          }
        }

      if (customerAlias && customerAlias !== 'undefined' && customerAlias.trim() !== '') {
        console.log('📝 Found customer alias:', customerAlias);
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
            // Remove urn:mail: prefix from DB alias for comparison
            const dbAliasWithoutPrefix = customerAlias?.replace('urn:mail:', '') || '';
            if (globalCompanyData.AliasName === dbAliasWithoutPrefix) {
              console.log('✅ DB alias is still valid in Nilvera system');
              // Use the actual alias from Nilvera system, not customer email
              if (globalCompanyData.AliasName && globalCompanyData.AliasName !== 'undefined' && globalCompanyData.AliasName.trim() !== '') {
                nilveraInvoiceData.CustomerAlias = `urn:mail:${globalCompanyData.AliasName}`;
                nilveraInvoiceData.EInvoice.InvoiceInfo.InvoiceProfile = 'TICARIFATURA';
                console.log('✅ Set InvoiceProfile to TICARIFATURA for e-fatura mükellefi');
              }
            } else {
              console.log('⚠️ DB alias is outdated, using Nilvera system alias:', globalCompanyData.AliasName);
              // Use the actual alias from Nilvera system, not customer email
              if (globalCompanyData.AliasName && globalCompanyData.AliasName !== 'undefined' && globalCompanyData.AliasName.trim() !== '') {
                nilveraInvoiceData.CustomerAlias = `urn:mail:${globalCompanyData.AliasName}`;
                nilveraInvoiceData.EInvoice.InvoiceInfo.InvoiceProfile = 'TICARIFATURA';
                console.log('✅ Set InvoiceProfile to TICARIFATURA for e-fatura mükellefi');
              }
              
                                  // Update customer table with current alias
                    if (globalCompanyData.AliasName && globalCompanyData.AliasName !== 'undefined' && globalCompanyData.AliasName.trim() !== '') {
                      await supabase
                        .from('customers')
                        .update({
                          einvoice_alias_name: globalCompanyData.AliasName,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', salesInvoice.customers?.id);
                    }
            }
          } else {
            console.log('ℹ️ Customer is not e-fatura mükellefi, CustomerAlias will not be included');
          }
        } catch (globalCompanyError) {
          console.error('❌ Alias verification failed:', globalCompanyError.message);
          // If verification fails, don't use the alias - but don't delete it either
          console.log('ℹ️ Alias verification failed, CustomerAlias will not be included');
        }
      } else {
        // Customer is not e-fatura mükellefi, no need to check alias
        console.log('ℹ️ Customer is not e-fatura mükellefi, CustomerAlias will not be included');
      }

      // For e-fatura mükellefi customers, CustomerAlias is REQUIRED
      if (salesInvoice.customers?.is_einvoice_mukellef && !nilveraInvoiceData.CustomerAlias) {
        console.log('⚠️ E-fatura mükellefi customer but no CustomerAlias found, this will cause API error');
        throw new Error(`Müşteri ${salesInvoice.customers?.name} (VKN: ${salesInvoice.customers?.tax_number}) e-fatura mükellefi ancak CustomerAlias bilgisi bulunamadı. Lütfen müşteri bilgilerini kontrol edin.`);
      }

      // Final check: only set CustomerAlias if it's valid
      if (nilveraInvoiceData.CustomerAlias && nilveraInvoiceData.CustomerAlias.includes('undefined')) {
        console.log('⚠️ Invalid CustomerAlias detected, removing it');
        delete nilveraInvoiceData.CustomerAlias;
      }

      console.log('📋 Nilvera invoice model created:', {
        invoiceNumber: nilveraInvoiceData.EInvoice.InvoiceInfo.InvoiceSerieOrNumber,
        customer: nilveraInvoiceData.EInvoice.CustomerInfo.Name,
        customerAlias: nilveraInvoiceData.CustomerAlias || 'N/A',
        invoiceProfile: nilveraInvoiceData.EInvoice.InvoiceInfo.InvoiceProfile,
        isEInvoice: nilveraInvoiceData.EInvoice.InvoiceInfo.InvoiceProfile === 'TICARIFATURA',
        total: salesInvoice.toplam_tutar,
        hasCustomerAlias: !!nilveraInvoiceData.CustomerAlias
      });

      // Log the full invoice data for debugging
      console.log('📄 Full invoice data being sent:', JSON.stringify(nilveraInvoiceData, null, 2));

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
        console.error('❌ Request data that caused error:', JSON.stringify(nilveraInvoiceData, null, 2));
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

  } catch (error) {
    console.error('❌ Error in nilvera-send-invoice function:', error);
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
