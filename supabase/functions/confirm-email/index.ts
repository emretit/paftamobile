import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-project-id, x-user-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {
  console.log('🚀 confirm-email edge function başladı');
  console.log('📝 Request method:', req.method);
  console.log('🔗 Request URL:', req.url);

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight response');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get('token');
    
    // Eğer POST ile çağrıldıysa ve URL'de token yoksa, body'den almayı dene
    if (!token && req.method === 'POST') {
      try {
        const body = await req.json();
        token = body?.token;
        console.log('📦 Body üzerinden alınan token:', token);
      } catch (e) {
        console.log('⚠️ Body parse edilemedi veya yok:', e?.message);
      }
    }
    console.log('🔍 Token parametresi:', token);

    if (!token) {
      console.log('❌ Token bulunamadı');
      if (req.method === 'POST') {
        return new Response(JSON.stringify({ success: false, error: "Token bulunamadı" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(`<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Token Eksik - PAFTA</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Token Eksik</h1>
            <p>URL'de token parametresi bulunamadı.</p>
            <a href="https://pafta.app/signin">Giriş Sayfasına Dön</a>
          </div>
        </body>
        </html>`, {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    console.log('✅ Token bulundu, Supabase bağlantısı kuruluyor...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log('✅ Supabase client oluşturuldu');

    // Token'ı arayalım - doğru tablo adını kullan
    console.log('🔍 Token ile confirmation arıyor...');
    const { data: confirmation, error: confirmError } = await supabase
      .from('user_email_confirmations')
      .select('user_id, email, used_at, expires_at')
      .eq('token', token)
      .is('used_at', null)  // Kullanılmamış token
      .gte('expires_at', new Date().toISOString())  // Süresi dolmamış
      .single();

    console.log('📊 Confirmation query sonucu:', { confirmation, confirmError });

    if (confirmError || !confirmation) {
      console.error('❌ Token bulunamadı veya geçersiz:', confirmError);
      if (req.method === 'POST') {
        return new Response(JSON.stringify({ success: false, error: 'Token bulunamadı, kullanılmış veya süresi dolmuş.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(`<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Token Geçersiz - PAFTA</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Token Geçersiz</h1>
            <p>Bu token bulunamadı, kullanılmış veya süresi dolmuş.</p>
            <a href="https://pafta.app/signin">Giriş Sayfasına Dön</a>
          </div>
        </body>
        </html>`, {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    console.log('✅ Confirmation bulundu:', confirmation);

    // Kullanıcıyı aktifleştir
    console.log('🔓 Kullanıcı aktifleştiriliyor...');
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', confirmation.user_id);

    if (userUpdateError) {
      console.error('❌ Kullanıcı güncelleme hatası:', userUpdateError);
      if (req.method === 'POST') {
        return new Response(JSON.stringify({ success: false, error: `Kullanıcı aktifleştirilemedi: ${userUpdateError.message}` }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(`<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Aktivasyon Hatası - PAFTA</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Aktivasyon Hatası</h1>
            <p>Kullanıcı aktifleştirilemedi: ${userUpdateError.message}</p>
            <a href="https://pafta.app/signin">Giriş Sayfasına Dön</a>
          </div>
        </body>
        </html>`, {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    console.log('✅ Kullanıcı başarıyla aktifleştirildi!');

    // Token'ı kullanılmış olarak işaretle
    await supabase
      .from('user_email_confirmations')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    console.log('✅ Token kullanılmış olarak işaretlendi');

    // Başarı yanıtı
    if (req.method === 'POST') {
      return new Response(JSON.stringify({ success: true, message: 'Hesabınız başarıyla aktifleştirildi.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Başarı sayfası (GET istekleri için)
    return new Response(`<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Başarılı - PAFTA</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            max-width: 600px; 
            background: white; 
            padding: 40px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .header {
            background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
            color: white;
            padding: 20px;
            margin: -40px -40px 30px -40px;
            border-radius: 15px 15px 0 0;
          }
          .success { color: #28a745; margin: 20px 0; }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin-top: 20px;
            transition: transform 0.2s;
          }
          .btn:hover { transform: translateY(-2px); }
        </style>
        <script>
          setTimeout(() => {
            window.location.href = 'https://pafta.app/signin';
          }, 3000);
        </script>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 PAFTA</h1>
          </div>
          <h2 class="success">✅ Hesabınız Başarıyla Aktifleştirildi!</h2>
          <p>Artık PAFTA platformunu kullanmaya başlayabilirsiniz.</p>
          <p><strong>3 saniye içinde giriş sayfasına yönlendirileceksiniz...</strong></p>
          <a href="https://pafta.app/signin" class="btn">Hemen Giriş Yap</a>
        </div>
      </body>
      </html>`, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });

  } catch (error: any) {
    console.error('❌ Beklenmeyen hata:', error);
    if (req.method === 'POST') {
      return new Response(JSON.stringify({ success: false, error: error?.message || 'Bilinmeyen hata' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    return new Response(`<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Sistem Hatası - PAFTA</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">Sistem Hatası</h1>
          <p>Beklenmeyen bir hata oluştu: ${error.message}</p>
          <a href="https://pafta.app/signin">Giriş Sayfasına Dön</a>
        </div>
      </body>
      </html>`, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  }
});