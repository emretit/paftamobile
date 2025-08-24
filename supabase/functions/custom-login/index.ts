import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 custom-login edge function başladı');
  console.log('🔗 Request URL:', req.url);
  console.log('📝 Request method:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight response');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    console.log('📧 Login attempt for email:', email);

    if (!email || !password) {
      console.log('❌ Email veya şifre eksik');
      return new Response(
        JSON.stringify({ error: 'Email ve şifre gereklidir' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Supabase client oluşturuluyor...');
    // Supabase client'ı service role ile oluştur
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Kullanıcı aranıyor...');
    // Kullanıcıyı bul
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('❌ Kullanıcı arama hatası:', userError);
      return new Response(
        JSON.stringify({ error: 'Giriş işlemi başarısız' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!user) {
      console.log('❌ Kullanıcı bulunamadı');
      return new Response(
        JSON.stringify({ error: 'Email veya şifre hatalı' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('👤 Kullanıcı bulundu:', user.email);

    // Kullanıcının aktif olup olmadığını kontrol et
    if (!user.is_active) {
      console.log('❌ Kullanıcı aktif değil');
      return new Response(
        JSON.stringify({ 
          error: 'Hesabınız aktif değil. Lütfen e-postanızı kontrol ederek hesabınızı onaylayın.',
          requiresConfirmation: true 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔐 Şifre kontrol ediliyor...');
    // Şifreyi kontrol et (crypto API kullanarak)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (user.password_hash !== hashedPassword) {
      console.log('❌ Şifre hatalı');
      return new Response(
        JSON.stringify({ error: 'Email veya şifre hatalı' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Şifre doğru');

    // Session token oluştur
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli

    console.log('🎫 Session token oluşturuluyor...');
    // Session kaydet
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token: sessionToken,
        expires_at: expiresAt.toISOString(),
        project_id: user.project_id
      });

    if (sessionError) {
      console.error('❌ Session kaydetme hatası:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Giriş işlemi başarısız' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📊 Son giriş tarihi güncelleniyor...');
    // Kullanıcının son giriş tarihini güncelle
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    console.log('✅ Login başarılı!');
    // Başarılı yanıt - hassas bilgileri çıkar
    const { password_hash, ...safeUser } = user;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        user: safeUser,
        session: {
          token: sessionToken,
          expires_at: expiresAt.toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Login function error:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});