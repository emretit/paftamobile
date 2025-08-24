import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-project-id, x-user-id',
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

    const projectId = req.headers.get('x-project-id') || '00000000-0000-0000-0000-000000000001';
    console.log('🏷️ Project ID:', projectId);

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
        project_id: projectId
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
        type: 'email_confirmation',
        expires_at: expiresAt.toISOString(),
        project_id: projectId
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

    // Email gönder
    const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/confirm-email?token=${token}`;
    console.log('📧 Confirmation URL:', confirmationUrl);

    let emailSent = false;
    let emailError: string | null = null;

    try {
      const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
      const { data: emailResp, error: resendError } = await resend.emails.send({
        from: 'PAFTA <onboarding@resend.dev>',
        to: [email],
        subject: 'PAFTA Hesabınızı Doğrulayın',
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>Merhaba ${full_name},</h2>
            <p>PAFTA hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:</p>
            <p>
              <a href="${confirmationUrl}"
                 style="display:inline-block;padding:12px 20px;background:#D32F2F;color:#fff;text-decoration:none;border-radius:8px">
                Hesabımı Doğrula
              </a>
            </p>
            <p>Buton çalışmazsa bu bağlantıyı tarayıcınızda açın:</p>
            <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
          </div>
        `,
      });
      if (resendError) {
        console.error('❌ Email gönderim hatası:', resendError);
        emailError = resendError.message || 'Resend error';
      } else {
        console.log('✅ Email gönderildi:', emailResp);
        emailSent = true;
      }
    } catch (e: any) {
      console.error('❌ Email gönderimi sırasında beklenmeyen hata:', e);
      emailError = e?.message || 'unknown';
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: emailSent
          ? 'Hesap oluşturuldu. Email adresinizi kontrol ederek hesabınızı onaylayın.'
          : 'Hesap oluşturuldu ancak email gönderimi başarısız oldu. Aşağıdaki bağlantıyı kullanabilirsiniz.',
        confirmationUrl,
        emailSent,
        emailError
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