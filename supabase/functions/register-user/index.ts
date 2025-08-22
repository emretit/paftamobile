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
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PAFTA - Hesap Onayı</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Geist+Sans:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Geist Sans', Arial, sans-serif;
              line-height: 1.6;
              color: #4A4A4A;
              background-color: #F5F5F5;
            }
            
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              border-radius: 12px;
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
              opacity: 0.3;
            }
            
            .logo-container {
              position: relative;
              z-index: 2;
              margin-bottom: 20px;
            }
            
            .logo {
              width: 80px;
              height: 80px;
              background: #ffffff;
              border-radius: 16px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: 700;
              color: #D32F2F;
              letter-spacing: -1px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            .brand-name {
              position: relative;
              z-index: 2;
              font-size: 28px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: -0.5px;
              margin-bottom: 8px;
            }
            
            .tagline {
              position: relative;
              z-index: 2;
              color: rgba(255, 255, 255, 0.9);
              font-size: 14px;
              font-weight: 500;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .greeting {
              font-size: 24px;
              font-weight: 600;
              color: #4A4A4A;
              margin-bottom: 16px;
              text-align: center;
            }
            
            .message {
              font-size: 16px;
              color: #666666;
              margin-bottom: 32px;
              line-height: 1.6;
              text-align: center;
            }
            
            .cta-container {
              text-align: center;
              margin: 32px 0;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
              color: #ffffff;
              padding: 16px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 14px rgba(211, 47, 47, 0.3);
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(211, 47, 47, 0.4);
            }
            
            .backup-link {
              margin-top: 32px;
              padding: 20px;
              background-color: #F5F5F5;
              border-radius: 8px;
              border-left: 4px solid #D32F2F;
            }
            
            .backup-text {
              font-size: 14px;
              color: #666666;
              margin-bottom: 8px;
            }
            
            .backup-url {
              font-size: 12px;
              color: #D32F2F;
              word-break: break-all;
              text-decoration: none;
            }
            
            .security-note {
              margin-top: 24px;
              padding: 16px;
              background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
              border-radius: 8px;
              border-left: 4px solid #F39C12;
              text-align: center;
            }
            
            .security-text {
              font-size: 13px;
              color: #E65100;
              font-weight: 500;
            }
            
            .footer {
              background: linear-gradient(135deg, #4A4A4A 0%, #2C2C2C 100%);
              padding: 30px;
              text-align: center;
              color: #ffffff;
            }
            
            .footer-text {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 8px;
            }
            
            .company-info {
              font-size: 14px;
              font-weight: 600;
              color: #ffffff;
              margin-bottom: 16px;
            }
            
            .social-links {
              margin-top: 20px;
            }
            
            .social-link {
              display: inline-block;
              margin: 0 8px;
              width: 32px;
              height: 32px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 6px;
              text-decoration: none;
              color: #ffffff;
              font-size: 14px;
              line-height: 32px;
              transition: all 0.3s ease;
            }
            
            .social-link:hover {
              background: #D32F2F;
              transform: translateY(-2px);
            }
            
            @media (max-width: 600px) {
              .email-container {
                margin: 20px;
                border-radius: 8px;
              }
              
              .header, .content, .footer {
                padding: 24px 20px;
              }
              
              .greeting {
                font-size: 20px;
              }
              
              .cta-button {
                padding: 14px 28px;
                font-size: 15px;
              }
              
              .logo {
                width: 60px;
                height: 60px;
                font-size: 24px;
              }
              
              .brand-name {
                font-size: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo-container">
                <div class="logo">
                  PAFTA
                </div>
              </div>
              <div class="brand-name">PAFTA</div>
              <div class="tagline">İş Süreçlerinizi Kolaylaştırın</div>
            </div>
            
            <div class="content">
              <h1 class="greeting">Hoş geldiniz${full_name ? `, ${full_name}` : ''}! 🎉</h1>
              
              <p class="message">
                PAFTA ailesine katıldığınız için teşekkür ederiz! Hesabınızı aktifleştirmek ve platformumuzun tüm özelliklerinden yararlanmaya başlamak için aşağıdaki butona tıklayın.
              </p>
              
              <div class="cta-container">
                <a href="${confirmLink}" class="cta-button">
                  ✨ Hesabımı Aktifleştir
                </a>
              </div>
              
              <div class="backup-link">
                <p class="backup-text">Buton çalışmıyor mu? Aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırın:</p>
                <a href="${confirmLink}" class="backup-url">${confirmLink}</a>
              </div>
              
              <div class="security-note">
                <p class="security-text">
                  🔒 Bu bağlantı güvenlik nedeniyle 24 saat sonra geçerliliğini yitirecektir.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p class="company-info">PAFTA</p>
              <p class="footer-text">İş Süreçleri Yönetim Platformu</p>
              <p class="footer-text">Bu e-posta, PAFTA hesap onay sistemi tarafından otomatik olarak gönderilmiştir.</p>
              <p class="footer-text" style="margin-top: 16px;">
                Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.
              </p>
            </div>
          </div>
        </body>
        </html>
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