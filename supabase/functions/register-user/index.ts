import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from "https://deno.land/std@0.168.0/crypto/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  console.log('🚀 register-user edge function başladı');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { email, password, full_name, company_name } = await req.json();
    console.log('📝 Kullanıcı kayıt isteği:', { email, full_name, company_name });

    if (!email || !password || !full_name || !company_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Tüm alanlar zorunludur' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Kullanıcı zaten var mı kontrol et
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bu email adresi zaten kullanımda' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(password)
    );
    const passwordHash = Array.from(new Uint8Array(hashedPassword))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Kullanıcıyı oluştur
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name,
        company_name,
        is_active: false,
        is_primary_account: true
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Kullanıcı oluşturma hatası:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Kullanıcı oluşturulamadı' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Email confirmation token oluştur
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli

    const { error: confirmationError } = await supabase
      .from('user_email_confirmations')
      .insert({
        user_id: user.id,
        email: email,
        token: token,
        expires_at: expiresAt.toISOString()
      });

    if (confirmationError) {
      console.error('❌ Confirmation token oluşturma hatası:', confirmationError);
      return new Response(
        JSON.stringify({ success: false, error: 'Doğrulama token\'ı oluşturulamadı' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Email gönder (simüle)
    const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/confirm-email?token=${token}`;
    console.log('📧 Confirmation URL:', confirmationUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Hesap oluşturuldu. Email adresinizi kontrol ederek hesabınızı onaylayın.',
        confirmationUrl // Geliştirme için - production'da kaldırılacak
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Beklenmeyen hata:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Sunucu hatası' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});