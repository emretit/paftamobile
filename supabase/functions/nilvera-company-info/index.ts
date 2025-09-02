import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, taxNumber } = await req.json();

    if (action === 'get_company_info') {
      try {
        console.log('🔍 Nilvera API üzerinden kendi firma bilgileri getiriliyor...');

        // Nilvera API anahtarını environment'tan al
        const nilveraApiKey = Deno.env.get('NILVERA_API_KEY');
        if (!nilveraApiKey) {
          throw new Error('Nilvera API anahtarı bulunamadı');
        }

        // Nilvera API Company endpoint'i - kendi firma bilgileri
        const nilveraApiUrl = 'https://apitest.nilvera.com/general/Company';
        
        console.log('📡 Nilvera API çağrısı yapılıyor...');
        console.log('📡 API URL:', nilveraApiUrl);

        // Nilvera API'dan kendi firma bilgilerini çek
        const companyResponse = await fetch(nilveraApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraApiKey}`,
            'Accept': '*/*',
            'Content-Type': 'application/json',
          }
        });

        console.log('📡 Nilvera API yanıt kodu:', companyResponse.status);

        if (!companyResponse.ok) {
          const errorText = await companyResponse.text();
          console.error('❌ Nilvera API hatası:', errorText);
          
          if (companyResponse.status === 401) {
            throw new Error('Nilvera API anahtarı geçersiz');
          } else if (companyResponse.status === 403) {
            throw new Error('Nilvera API erişim yetkisi yok');
          } else if (companyResponse.status === 404) {
            throw new Error('Firma bilgileri bulunamadı');
          } else {
            throw new Error(`Nilvera API hatası: ${companyResponse.status} - ${errorText}`);
          }
        }

        const companyData = await companyResponse.json();
        console.log('✅ Nilvera API yanıtı alındı:', JSON.stringify(companyData, null, 2));

        // Firma bilgilerini düzenle
        const formattedCompanyInfo = {
          name: companyData.Name || '',
          taxNumber: companyData.TaxNumber || '',
          taxOffice: companyData.TaxOffice || '',
          address: companyData.Address || '',
          district: companyData.District || '',
          city: companyData.City || '',
          country: companyData.Country || '',
          postalCode: companyData.PostalCode || '',
          phoneNumber: companyData.PhoneNumber || '',
          fax: companyData.Fax || '',
          email: companyData.Email || '',
          website: companyData.WebSite || '',
          isActive: companyData.IsActive || false,
          aliases: companyData.Aliases || [],
          // Ödeme bilgileri
          payeeFinancialAccountID: companyData.PayeeFinancialAccountID || '',
          paymentMeansChannelCode: companyData.PaymentMeansChannelCode || '',
          paymentMeansCode: companyData.PaymentMeansCode || ''
        };

        return new Response(JSON.stringify({ 
          success: true,
          data: formattedCompanyInfo,
          message: 'Firma bilgileri başarıyla getirildi'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('❌ Firma bilgileri alma hatası:', error);
        
        return new Response(JSON.stringify({ 
          success: false,
          error: error.message || 'Firma bilgileri alınamadı'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Mükellef sorgulama işlemi için de bir endpoint ekleyelim
    if (action === 'search_mukellef') {
      if (!taxNumber || taxNumber.length < 10) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Geçerli bir vergi numarası giriniz (10-11 haneli)'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        console.log('🔍 Nilvera API üzerinden mükellef sorgulama:', taxNumber);

        const nilveraApiKey = Deno.env.get('NILVERA_API_KEY');
        console.log('🔑 API Key kontrolü:', nilveraApiKey ? 'Mevcut' : 'Bulunamadı');
        if (!nilveraApiKey) {
          throw new Error('Nilvera API anahtarı bulunamadı - Environment variable NILVERA_API_KEY ayarlanmalı');
        }

        // Mükellef sorgulama endpoint'i - GlobalCompany kullanarak (VKN parametresi ile)
        const mukellefApiUrl = `https://apitest.nilvera.com/general/GlobalCompany?VKN=${taxNumber}`;
        
        console.log('📡 Mükellef sorgulama API çağrısı yapılıyor...');
        console.log('📡 API URL:', mukellefApiUrl);

        console.log('📡 API çağrısı yapılıyor...');
        console.log('📡 Headers:', {
          'Authorization': `Bearer ${nilveraApiKey.substring(0, 10)}...`,
          'Content-Type': 'application/json'
        });

        const mukellefResponse = await fetch(mukellefApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraApiKey}`,
            'Accept': '*/*',
            'Content-Type': 'application/json',
          }
        });

        console.log('📡 Mükellef API yanıt kodu:', mukellefResponse.status);

        if (!mukellefResponse.ok) {
          const errorText = await mukellefResponse.text();
          console.error('❌ Mükellef API hatası:', {
            status: mukellefResponse.status,
            statusText: mukellefResponse.statusText,
            errorText: errorText,
            url: mukellefApiUrl,
            taxNumber: taxNumber
          });
          
          if (mukellefResponse.status === 404) {
            console.log('ℹ️ Mükellef bulunamadı (404) - e-fatura mükellefi değil');
            return new Response(JSON.stringify({ 
              success: true,
              isEinvoiceMukellef: false,
              message: 'Bu vergi numarası e-fatura mükellefi değil'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          if (mukellefResponse.status === 401) {
            throw new Error('Nilvera API anahtarı geçersiz veya süresi dolmuş');
          } else if (mukellefResponse.status === 403) {
            throw new Error('Nilvera API erişim yetkisi yok');
          } else if (mukellefResponse.status === 429) {
            throw new Error('Nilvera API rate limit aşıldı, lütfen daha sonra tekrar deneyin');
          } else {
            throw new Error(`Mükellef API hatası: ${mukellefResponse.status} - ${errorText}`);
          }
        }

        const mukellefData = await mukellefResponse.json();
        console.log('✅ GlobalCompany API yanıtı alındı:', JSON.stringify(mukellefData, null, 2));

        // GlobalCompany yanıtını işle - AliasName varsa e-fatura mükellefi
        const isEinvoiceMukellef = mukellefData && mukellefData.AliasName;
        let formattedData = null;

        if (isEinvoiceMukellef) {
          formattedData = {
            aliasName: mukellefData.AliasName || '',
            companyName: mukellefData.Name || mukellefData.Title || '',
            taxNumber: mukellefData.VKN || '',
            taxOffice: mukellefData.TaxOffice || '',
            address: mukellefData.Address || '',
            city: mukellefData.City || '',
            district: mukellefData.District || '',
            mersisNo: mukellefData.MersisNo || '',
            sicilNo: mukellefData.SicilNo || ''
          };
        }

        return new Response(JSON.stringify({ 
          success: true,
          isEinvoiceMukellef,
          data: formattedData,
          message: isEinvoiceMukellef ? 
            'Bu vergi numarası e-fatura mükellefidir' : 
            'Bu vergi numarası e-fatura mükellefi değil'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('❌ Mükellef sorgulama hatası:', error);
        
        return new Response(JSON.stringify({ 
          success: false,
          error: error.message || 'Mükellef sorgulaması yapılamadı'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    throw new Error('Geçersiz işlem');

  } catch (error) {
    console.error('❌ Nilvera company info function hatası:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Bilinmeyen hata oluştu'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
