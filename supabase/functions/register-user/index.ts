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

    if (!email || !password || !company_name) {
      return new Response(
        JSON.stringify({ error: 'Email, şifre ve şirket adı gereklidir' }),
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

    // Benzersiz proje adı oluştur (sequential numbering ile)
    let projectName = company_name;
    let projectCounter = 1;
    
    // Aynı isimde proje var mı kontrol et
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('name')
      .like('name', `${company_name}%`)
      .order('name');

    if (existingProjects && existingProjects.length > 0) {
      // En büyük numarayı bul
      const maxNumber = existingProjects.reduce((max, project) => {
        const match = project.name.match(new RegExp(`^${company_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: #(\\d+))?$`));
        if (match) {
          const num = match[1] ? parseInt(match[1]) : 1;
          return Math.max(max, num);
        }
        return max;
      }, 0);
      
      if (maxNumber > 0) {
        projectCounter = maxNumber + 1;
        projectName = `${company_name} #${projectCounter}`;
      }
    }

    // Yeni proje oluştur
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: projectName,
        description: `${company_name} şirketi için otomatik oluşturulmuş proje`
      })
      .select('id')
      .single();

    if (projectError) {
      console.error('Proje oluşturma hatası:', projectError);
      return new Response(
        JSON.stringify({ error: 'Proje oluşturulurken hata oluştu' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const projectId = newProject.id;

    // Kullanıcıyı ekle (admin rolü ile ama aktif değil)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        full_name,
        role: 'admin', // Admin olarak ekle
        is_active: false, // Mail onayı bekliyor
        project_id: projectId,
        company_name
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
        expires_at: expiresAt.toISOString(),
        project_id: projectId
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
      subject: '✨ PAFTA hesabınızı aktifleştirin',
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PAFTA Hesap Onayı</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
              padding: 20px 10px;
              line-height: 1.6;
            }
            
            .email-container {
              max-width: 480px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
            }
            
            .header {
              background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
              color: #ffffff;
              text-align: center;
              padding: 30px 20px 25px;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><radialGradient id="a" cx="50%" cy="0%" r="100%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><rect width="100" height="20" fill="url(%23a)"/></svg>') repeat-x;
            }
            
            .logo {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.15);
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              font-weight: 700;
              margin: 0 auto 15px;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .brand-name {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 4px;
            }
            
            .tagline {
              font-size: 14px;
              opacity: 0.9;
              font-weight: 500;
            }
            
            .content {
              padding: 35px 25px;
              text-align: center;
            }
            
            .greeting {
              font-size: 26px;
              font-weight: 700;
              color: #1F2937;
              margin-bottom: 20px;
              line-height: 1.3;
            }
            
            .welcome-message {
              font-size: 16px;
              color: #4B5563;
              margin-bottom: 30px;
              line-height: 1.6;
            }
            
            .cta-container {
              margin: 35px 0;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
              color: #ffffff;
              padding: 18px 35px;
              border-radius: 50px;
              text-decoration: none;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3);
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
              letter-spacing: 0.5px;
              position: relative;
              overflow: hidden;
            }
            
            .cta-button::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.5s;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 30px rgba(211, 47, 47, 0.4);
            }
            
            .cta-button:hover::before {
              left: 100%;
            }
            
            .backup-link {
              margin-top: 25px;
              padding: 15px;
              background: #F9FAFB;
              border-radius: 12px;
              border: 1px solid #E5E7EB;
            }
            
            .backup-text {
              font-size: 13px;
              color: #6B7280;
              margin-bottom: 8px;
              font-weight: 500;
            }
            
            .backup-url {
              font-size: 12px;
              color: #D32F2F;
              word-break: break-all;
              text-decoration: none;
              background: #ffffff;
              padding: 8px;
              border-radius: 6px;
              display: block;
              border: 1px solid #E5E7EB;
            }
            
            .security-note {
              margin-top: 20px;
              padding: 12px;
              background: #FEF2F2;
              border-radius: 8px;
              border-left: 3px solid #D32F2F;
            }
            
            .security-text {
              font-size: 12px;
              color: #991B1B;
              font-weight: 500;
            }
            
            .footer {
              background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
              padding: 25px 20px;
              text-align: center;
              color: #ffffff;
            }
            
            .footer-brand {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            
            .footer-text {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 6px;
              line-height: 1.5;
            }
            
            .contact-link {
              color: #EF4444;
              text-decoration: none;
              font-weight: 600;
            }
            
            @media (max-width: 500px) {
              body {
                padding: 10px 5px;
              }
              
              .email-container {
                border-radius: 16px;
              }
              
              .header {
                padding: 25px 15px 20px;
              }
              
              .content {
                padding: 25px 20px;
              }
              
              .footer {
                padding: 20px 15px;
              }
              
              .greeting {
                font-size: 22px;
              }
              
              .welcome-message {
                font-size: 15px;
              }
              
              .cta-button {
                padding: 16px 30px;
                font-size: 15px;
              }
              
              .logo {
                width: 50px;
                height: 50px;
                font-size: 18px;
              }
              
              .brand-name {
                font-size: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">PAFTA</div>
              <div class="brand-name">PAFTA</div>
              <div class="tagline">İş Yönetim Sistemi</div>
            </div>
            
            <div class="content">
              <h1 class="greeting">Hoş Geldiniz${full_name ? `, ${full_name}` : ''}! 🎉</h1>
              
              <p class="welcome-message">
                Hesabınızı aktifleştirmek ve PAFTA'nın tüm özelliklerinden yararlanmaya başlamak için aşağıdaki butona tıklayın.
              </p>
              
              <div class="cta-container">
                <a href="${confirmLink}" class="cta-button">
                  🚀 Hesabımı Aktifleştir
                </a>
              </div>
              
              <div class="backup-link">
                <p class="backup-text">Buton çalışmıyor mu? Bu bağlantıyı kopyalayıp tarayıcınıza yapıştırın:</p>
                <a href="${confirmLink}" class="backup-url">${confirmLink}</a>
              </div>
              
              <div class="security-note">
                <p class="security-text">
                  🔒 Bu bağlantı güvenlik nedeniyle 24 saat sonra geçerliliğini yitirecektir.
                </p>
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-brand">PAFTA</div>
              <p class="footer-text">Bu e-posta, PAFTA hesap onay sistemi tarafından gönderilmiştir.</p>
              <p class="footer-text">
                Sorularınız için: <a href="mailto:destek@pafta.app" class="contact-link">destek@pafta.app</a>
              </p>
              <p class="footer-text">
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