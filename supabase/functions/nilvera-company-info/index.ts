import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Authorization header gerekli'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Geçersiz kullanıcı token'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Kullanıcı profili bulunamadı'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Nilvera auth settings
    const { data: nilveraAuth, error: authError } = await supabase
      .from('nilvera_auth')
      .select('*')
      .eq('company_id', profile.company_id)
      .eq('is_active', true)
      .single();

    if (authError || !nilveraAuth) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Nilvera kimlik doğrulama bilgileri bulunamadı. Lütfen ayarlar sayfasından Nilvera bilgilerinizi girin.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }


    const { action, taxNumber } = await req.json();

    if (action === 'get_company_info') {
      try {
        console.log('🔍 Nilvera API üzerinden kendi firma bilgileri getiriliyor...');

        console.log('🔑 Nilvera API key kontrolü:', nilveraAuth.api_key ? 'Mevcut' : 'Bulunamadı');

        // Nilvera API Company endpoint'i - kendi firma bilgileri
        const nilveraApiUrl = nilveraAuth.test_mode 
          ? 'https://apitest.nilvera.com/general/Company'
          : 'https://api.nilvera.com/general/Company';
        
        console.log('📡 Nilvera API çağrısı yapılıyor...');
        console.log('📡 API URL:', nilveraApiUrl);

        // Nilvera API'dan kendi firma bilgilerini çek
        const companyResponse = await fetch(nilveraApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraAuth.api_key}`,
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

        console.log('🔑 Nilvera API key kontrolü:', nilveraAuth.api_key ? 'Mevcut' : 'Bulunamadı');

        // Mükellef sorgulama endpoint'i - GİB resmi mükellef listesinden VKN ile sorgulama
        const mukellefBaseUrl = nilveraAuth.test_mode 
          ? 'https://apitest.nilvera.com/general/TaxPayers/SearchByVKN'
          : 'https://api.nilvera.com/general/TaxPayers/SearchByVKN';
        const mukellefApiUrl = `${mukellefBaseUrl}?vkn=${taxNumber}`;
        
        console.log('📡 Mükellef sorgulama API çağrısı yapılıyor...');
        console.log('📡 API URL:', mukellefApiUrl);

        console.log('📡 API çağrısı yapılıyor...');
        console.log('📡 Headers:', {
          'Authorization': `Bearer ${nilveraAuth.api_key.substring(0, 10)}...`,
          'Content-Type': 'application/json'
        });

        const mukellefResponse = await fetch(mukellefApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${nilveraAuth.api_key}`,
            'Accept': '*/*',
            'Content-Type': 'application/json',
          }
        });

        console.log('📡 Mükellef API yanıt kodu:', mukellefResponse.status);

        // 204 No Content - mükellef bulunamadı ama başarılı istek
        if (mukellefResponse.status === 204) {
          console.log('ℹ️ 204 No Content - Mükellef bulunamadı');
          return new Response(JSON.stringify({ 
            success: true,
            isEinvoiceMukellef: false,
            message: 'Bu vergi numarası e-fatura mükellefi değil'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

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
            console.log('ℹ️ Mükellef bulunamadı (404) - API endpoint bulunamadı veya vergi numarası yok');
            console.log('ℹ️ API URL:', mukellefApiUrl);
            console.log('ℹ️ Aranan vergi numarası:', taxNumber);
            return new Response(JSON.stringify({ 
              success: true,
              isEinvoiceMukellef: false,
              message: 'Bu vergi numarası e-fatura mükellefi değil veya bulunamadı'
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

        // Yanıtı önce text olarak al, sonra JSON parse et
        const responseText = await mukellefResponse.text();
        console.log('📡 Ham API yanıtı:', responseText);
        console.log('📡 Yanıt uzunluğu:', responseText.length);
        
        let mukellefData = null;
        try {
          if (responseText && responseText.trim()) {
            mukellefData = JSON.parse(responseText);
            console.log('✅ JSON parse başarılı:', JSON.stringify(mukellefData, null, 2));
          } else {
            console.log('⚠️ Boş yanıt alındı');
            console.log('⚠️ Ham yanıt detayları:', {
              responseTextExists: !!responseText,
              responseTextLength: responseText ? responseText.length : 0,
              responseTextTrimmed: responseText ? responseText.trim() : '',
              responseTextFirstChars: responseText ? responseText.substring(0, 100) : ''
            });
            
            // Boş yanıt durumunda da "mükellef değil" olarak döndürelim
            return new Response(JSON.stringify({ 
              success: true,
              isEinvoiceMukellef: false,
              message: 'Bu vergi numarası e-fatura mükellefi değil (boş yanıt)'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (parseError) {
          console.error('❌ JSON parse hatası:', parseError);
          console.error('❌ Ham yanıt:', responseText);
          throw new Error(`API yanıtı geçerli JSON formatında değil: ${parseError.message}`);
        }

        // SearchByVKN yanıtını işle - GİB resmi mükellef listesinden
        let isEinvoiceMukellef = false;
        let formattedData = null;

        console.log('🔍 GİB API yanıt formatı:', typeof mukellefData);
        console.log('🔍 GİB API yanıt içeriği:', JSON.stringify(mukellefData, null, 2));

        // SearchByVKN API'si array döndürür
        if (mukellefData && Array.isArray(mukellefData) && mukellefData.length > 0) {
          const taxpayer = mukellefData[0]; // İlk sonucu al
          console.log('🎯 GİB mükellef bulundu:', taxpayer.VKN || taxpayer.TaxNumber);
          console.log('🎯 GİB mükellef detayları:', JSON.stringify(taxpayer, null, 2));
          
          // E-fatura mükellefi mi kontrol et
          isEinvoiceMukellef = true; // GİB listesinde varsa e-fatura mükellefidir
          
          formattedData = {
            aliasName: taxpayer.AliasName || '',
            companyName: taxpayer.Title || taxpayer.Name || '',
            taxNumber: taxpayer.VKN || taxpayer.TaxNumber || '',
            taxOffice: taxpayer.TaxOffice || '',
            address: taxpayer.Address || '',
            city: taxpayer.City || '',
            district: taxpayer.District || '',
            mersisNo: taxpayer.MersisNo || '',
            sicilNo: taxpayer.SicilNo || '',
            accountType: taxpayer.AccountType || '',
            type: taxpayer.Type || ''
          };
          
          console.log('✅ E-fatura mükellefi onaylandı (GİB listesinde mevcut)');
          
        } else if (mukellefData && Array.isArray(mukellefData) && mukellefData.length === 0) {
          console.log('ℹ️ GİB listesinde mükellef bulunamadı - e-fatura mükellefi değil');
          isEinvoiceMukellef = false;
        } else {
          console.log('❌ GİB API yanıt formatı beklenmediği gibi');
          console.log('❌ GİB API yanıtı detayları:', {
            hasData: !!mukellefData,
            dataType: typeof mukellefData,
            isArray: Array.isArray(mukellefData),
            length: mukellefData ? mukellefData.length : 'N/A',
            fullResponse: mukellefData
          });
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
