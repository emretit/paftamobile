import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, full_name, company_name } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email ve şifre gereklidir' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Supabase client'ı service role ile oluştur
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Email kontrolü
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Bu email adresi zaten kullanımda' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Şifreyi hashle (crypto API kullanarak)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Email onay token'ı oluştur
    const confirmationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli

    // Kullanıcıyı ekle (admin rolü ile ama aktif değil)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        full_name,
        role: 'admin', // Admin olarak ekle
        is_active: false // Mail onayı bekliyor
      })
      .select()
      .single();

    if (error) {
      console.error('Kullanıcı ekleme hatası:', error);
      return new Response(
        JSON.stringify({ error: 'Kayıt işlemi başarısız' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Email onay kaydı ekle
    const { error: confirmationError } = await supabase
      .from('user_email_confirmations')
      .insert({
        user_id: newUser.id,
        email,
        token: confirmationToken,
        type: 'signup',
        expires_at: expiresAt.toISOString()
      });

    if (confirmationError) {
      console.error('Email onay kaydı hatası:', confirmationError);
      // Kullanıcıyı sil
      await supabase.from('users').delete().eq('id', newUser.id);
      return new Response(
        JSON.stringify({ error: 'Kayıt işlemi başarısız' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Email gönderimi (Resend)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY eksik');
      return new Response(
        JSON.stringify({ error: 'Email servisi yapılandırılmamış' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);
    const confirmLink = `https://vwhwufnckpqirxptwncw.supabase.co/functions/v1/confirm-email?token=${confirmationToken}`;

    const { error: sendError } = await resend.emails.send({
      from: 'PAFTA <noreply@pafta.app>',
      to: [email],
      subject: 'PAFTA hesabınızı onaylayın 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6">
          <h2>Merhaba${full_name ? `, ${full_name}` : ''}!</h2>
          <p>PAFTA hesabınızı tamamlamak için aşağıdaki butona tıklayın.</p>
          <p style="margin:24px 0">
            <a href="${confirmLink}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Hesabımı Onayla</a>
          </p>
          <p>Buton çalışmazsa bu bağlantıyı kopyalayın:</p>
          <p><a href="${confirmLink}">${confirmLink}</a></p>
          <p style="color:#6b7280;font-size:12px">Bu bağlantı 24 saat sonra geçerliliğini yitirir.</p>
        </div>
      `,
    });

    if (sendError) {
      console.error('Resend email gönderim hatası:', sendError);
      return new Response(
        JSON.stringify({ error: 'Onay e-postası gönderilemedi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Başarılı yanıt
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Kayıt başarılı. Email adresinizi kontrol ederek hesabınızı onaylayın.',
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role
        },
        requiresConfirmation: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Register error:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});