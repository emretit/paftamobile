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

    // Default project oluştur veya var olanı bul
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('name', company_name || 'Default Project')
      .maybeSingle();

    let projectId;
    if (existingProject) {
      projectId = existingProject.id;
    } else {
      // Yeni proje oluştur
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: company_name || 'Default Project',
          description: `${company_name || 'Şirket'} için proje`
        })
        .select('id')
        .single();

      if (projectError) {
        console.error('Proje oluşturma hatası:', projectError);
        return new Response(
          JSON.stringify({ error: 'Kayıt işlemi başarısız' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      projectId = newProject.id;
    }

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
              font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #4A4A4A;
              background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
              min-height: 100vh;
            }
            
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              box-shadow: 0 20px 40px rgba(211, 47, 47, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05);
              border-radius: 20px;
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
              padding: 50px 30px 40px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
              opacity: 0.6;
            }
            
            .header::after {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
              animation: pulse 6s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
              50% { opacity: 0.1; transform: scale(1.1) rotate(10deg); }
            }
            
            .logo-container {
              position: relative;
              z-index: 3;
              margin-bottom: 24px;
            }
            
            .logo {
              width: 100px;
              height: 100px;
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              border-radius: 24px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 36px;
              font-weight: 800;
              color: #D32F2F;
              letter-spacing: -2px;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(255, 255, 255, 0.8);
              border: 2px solid rgba(255, 255, 255, 0.9);
            }
            
            .brand-name {
              position: relative;
              z-index: 3;
              font-size: 32px;
              font-weight: 800;
              color: #ffffff;
              letter-spacing: -1px;
              margin-bottom: 12px;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            }
            
            .tagline {
              position: relative;
              z-index: 3;
              color: rgba(255, 255, 255, 0.95);
              font-size: 16px;
              font-weight: 600;
              letter-spacing: 0.5px;
            }
            
            .content {
              padding: 50px 40px;
              background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
            }
            
            .greeting {
              font-size: 28px;
              font-weight: 700;
              color: #1F2937;
              margin-bottom: 20px;
              text-align: center;
              line-height: 1.2;
            }
            
            .welcome-message {
              font-size: 18px;
              color: #4B5563;
              margin-bottom: 24px;
              line-height: 1.7;
              text-align: center;
            }
            
            .company-message {
              font-size: 16px;
              color: #6B7280;
              margin-bottom: 40px;
              line-height: 1.6;
              text-align: center;
              padding: 20px;
              background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
              border-radius: 12px;
              border-left: 4px solid #D32F2F;
            }
            
            .cta-container {
              text-align: center;
              margin: 40px 0;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
              color: #ffffff;
              padding: 18px 40px;
              border-radius: 12px;
              text-decoration: none;
              font-weight: 700;
              font-size: 18px;
              box-shadow: 0 8px 25px rgba(211, 47, 47, 0.4);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
              transform: translateY(-3px) scale(1.02);
              box-shadow: 0 12px 35px rgba(211, 47, 47, 0.5);
            }
            
            .cta-button:hover::before {
              left: 100%;
            }
            
            .features-section {
              margin: 50px 0;
              padding: 30px;
              background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
              border-radius: 16px;
              border: 1px solid #E5E7EB;
            }
            
            .features-title {
              font-size: 22px;
              font-weight: 700;
              color: #1F2937;
              text-align: center;
              margin-bottom: 30px;
            }
            
            .features-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            
            .feature-item {
              background: #ffffff;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              border: 1px solid #F3F4F6;
              transition: all 0.3s ease;
            }
            
            .feature-item:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(211, 47, 47, 0.1);
              border-color: rgba(211, 47, 47, 0.2);
            }
            
            .feature-icon {
              font-size: 24px;
              margin-bottom: 10px;
            }
            
            .feature-title {
              font-size: 16px;
              font-weight: 600;
              color: #1F2937;
              margin-bottom: 8px;
            }
            
            .feature-desc {
              font-size: 14px;
              color: #6B7280;
              line-height: 1.5;
            }
            
            .backup-link {
              margin-top: 40px;
              padding: 25px;
              background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
              border-radius: 12px;
              border-left: 5px solid #F59E0B;
            }
            
            .backup-text {
              font-size: 15px;
              color: #92400E;
              margin-bottom: 12px;
              font-weight: 600;
            }
            
            .backup-url {
              font-size: 13px;
              color: #D97706;
              word-break: break-all;
              text-decoration: none;
              background: rgba(255, 255, 255, 0.7);
              padding: 10px;
              border-radius: 6px;
              display: block;
            }
            
            .security-note {
              margin-top: 30px;
              padding: 20px;
              background: linear-gradient(135deg, #FEF2F2 0%, #FDE8E8 100%);
              border-radius: 12px;
              border-left: 5px solid #D32F2F;
              text-align: center;
            }
            
            .security-text {
              font-size: 14px;
              color: #991B1B;
              font-weight: 600;
            }
            
            .footer {
              background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
              padding: 40px 30px;
              text-align: center;
              color: #ffffff;
              position: relative;
            }
            
            .footer::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 1px;
              background: linear-gradient(90deg, transparent, #D32F2F, transparent);
            }
            
            .footer-brand {
              font-size: 24px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 12px;
            }
            
            .footer-text {
              font-size: 14px;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 8px;
              line-height: 1.6;
            }
            
            .footer-highlight {
              font-size: 16px;
              font-weight: 600;
              color: #F3F4F6;
              margin: 20px 0 16px;
            }
            
            .contact-info {
              margin-top: 24px;
              padding-top: 24px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .contact-link {
              color: #EF4444;
              text-decoration: none;
              font-weight: 600;
            }
            
            .contact-link:hover {
              color: #DC2626;
            }
            
            @media (max-width: 600px) {
              .email-container {
                margin: 20px;
                border-radius: 16px;
              }
              
              .header {
                padding: 40px 24px 30px;
              }
              
              .content {
                padding: 40px 24px;
              }
              
              .footer {
                padding: 30px 24px;
              }
              
              .greeting {
                font-size: 24px;
              }
              
              .welcome-message {
                font-size: 16px;
              }
              
              .cta-button {
                padding: 16px 32px;
                font-size: 16px;
              }
              
              .logo {
                width: 80px;
                height: 80px;
                font-size: 28px;
              }
              
              .brand-name {
                font-size: 28px;
              }
              
              .features-grid {
                grid-template-columns: 1fr;
                gap: 15px;
              }
              
              .features-section {
                margin: 30px 0;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo-container">
                <div class="logo">PAFTA</div>
              </div>
              <div class="brand-name">PAFTA</div>
              <div class="tagline">İş Yönetim Sistemi</div>
            </div>
            
            <div class="content">
              <h1 class="greeting">Hoş Geldiniz${full_name ? `, ${full_name}` : ''}! 🎉</h1>
              
              <p class="welcome-message">
                PAFTA ailesine katıldığınız için teşekkür ederiz! Hesabınızı aktifleştirmek ve platformumuzun tüm özelliklerinden yararlanmaya başlamak için aşağıdaki butona tıklayın.
              </p>

              ${company_name ? `
                <div class="company-message">
                  <strong>${company_name}</strong> şirketi adına PAFTA İş Yönetim Sistemi'ne kayıt olduğunuz için teşekkür ederiz!
                </div>
              ` : ''}
              
              <div class="cta-container">
                <a href="${confirmLink}" class="cta-button">
                  🚀 Hesabımı Aktifleştir
                </a>
              </div>

              <div class="features-section">
                <h2 class="features-title">PAFTA ile neler yapabilirsiniz?</h2>
                <div class="features-grid">
                  <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div class="feature-title">CRM & Müşteri Yönetimi</div>
                    <div class="feature-desc">Müşterilerinizi organize edin, satış fırsatlarını takip edin</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">💰</div>
                    <div class="feature-title">Finansal Yönetim</div>
                    <div class="feature-desc">Gelir-gider takibi, faturalandırma ve raporlama</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Satış & Pazarlama</div>
                    <div class="feature-desc">Satış süreçlerinizi optimize edin, performansınızı artırın</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-title">Proje Yönetimi</div>
                    <div class="feature-desc">Projelerinizi planlayın, takip edin ve teslim edin</div>
                  </div>
                </div>
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
              <div class="footer-brand">PAFTA</div>
              <p class="footer-highlight">İş Süreçlerinizi Dijitalleştirin</p>
              <p class="footer-text">Modern işletmeler için kapsamlı iş yönetim çözümü</p>
              <p class="footer-text">Bu e-posta, PAFTA hesap onay sistemi tarafından otomatik olarak gönderilmiştir.</p>
              
              <div class="contact-info">
                <p class="footer-text">
                  Sorularınız için: <a href="mailto:destek@pafta.app" class="contact-link">destek@pafta.app</a>
                </p>
                <p class="footer-text" style="margin-top: 16px;">
                  Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle yok sayabilirsiniz.
                </p>
              </div>
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