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
              color: #4a5568;
              background: #f8fafc;
              margin: 0;
              padding: 20px 0;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(211, 47, 47, 0.08);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
              padding: 40px 30px;
              text-align: center;
            }
            
            .logo {
              width: 120px;
              height: auto;
              filter: brightness(0) invert(1);
              margin-bottom: 8px;
            }
            
            .subtitle {
              color: #ffffff;
              font-size: 14px;
              font-weight: 500;
              opacity: 0.9;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .welcome-title {
              color: #1a202c;
              font-size: 32px;
              font-weight: 700;
              line-height: 1.2;
              margin: 0 0 24px;
              text-align: center;
            }
            
            .greeting {
              color: #2d3748;
              font-size: 18px;
              font-weight: 600;
              margin: 0 0 16px;
            }
            
            .welcome-text {
              color: #4a5568;
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 20px;
            }
            
            .description {
              color: #718096;
              font-size: 15px;
              line-height: 1.6;
              margin: 0 0 32px;
            }
            
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            
            .cta-button {
              background-color: #D32F2F;
              border-radius: 8px;
              color: #ffffff;
              display: inline-block;
              font-size: 16px;
              font-weight: 600;
              text-align: center;
              text-decoration: none;
              padding: 16px 32px;
              border: none;
              box-shadow: 0 4px 14px rgba(211, 47, 47, 0.3);
              transition: all 0.2s ease;
            }
            
            .cta-button:hover {
              background-color: #B71C1C;
              transform: translateY(-1px);
              box-shadow: 0 6px 20px rgba(211, 47, 47, 0.4);
            }
            
            .divider {
              border: none;
              border-top: 1px solid #e2e8f0;
              margin: 32px 0;
            }
            
            .features-title {
              color: #2d3748;
              font-size: 18px;
              font-weight: 600;
              text-align: center;
              margin: 0 0 24px;
            }
            
            .features-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin: 0 0 24px;
            }
            
            .feature-item {
              text-align: center;
              padding: 16px 8px;
            }
            
            .feature-icon {
              font-size: 24px;
              margin: 0 0 8px;
            }
            
            .feature-text {
              color: #4a5568;
              font-size: 14px;
              font-weight: 500;
              margin: 0;
            }
            
            .security-note {
              background-color: #fef5e7;
              border-radius: 8px;
              padding: 16px;
              margin: 32px 0;
              text-align: center;
            }
            
            .security-text {
              color: #744210;
              font-size: 14px;
              line-height: 1.5;
              margin: 0;
            }
            
            .alternative-section {
              margin: 32px 0;
            }
            
            .alternative-text {
              color: #718096;
              font-size: 14px;
              line-height: 1.5;
              text-align: center;
              margin: 0 0 16px;
            }
            
            .link-text {
              background-color: #f7fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              color: #4a5568;
              font-size: 12px;
              line-height: 1.4;
              padding: 12px;
              word-break: break-all;
              margin: 0;
            }
            
            .footer {
              background-color: #f8fafc;
              border-top: 1px solid #e2e8f0;
              padding: 24px 30px;
              text-align: center;
            }
            
            .footer-text {
              color: #718096;
              font-size: 14px;
              margin: 0 0 8px;
            }
            
            .footer-link {
              color: #D32F2F;
              text-decoration: none;
              font-weight: 500;
            }
            
            .footer-brand {
              color: #a0aec0;
              font-size: 12px;
              margin: 0;
            }
            
            /* Mobile responsive */
            @media (max-width: 600px) {
              .email-container {
                margin: 0 10px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .features-grid {
                grid-template-columns: 1fr;
                gap: 12px;
              }
              
              .welcome-title {
                font-size: 28px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <img src="https://527a7790-65f5-4ba3-87eb-7299d2f3415a.sandbox.lovable.dev/logo.svg" 
                   alt="PAFTA Logo" class="logo">
              <div class="subtitle">İş Yönetim Sistemi</div>
            </div>
            
            <!-- Content -->
            <div class="content">
              <h1 class="welcome-title">Hoş Geldiniz! 🎉</h1>
              
              <div class="greeting">
                Merhaba <strong>${full_name || "Değerli Kullanıcı"}</strong>,
              </div>
              
              <div class="welcome-text">
                ${company_name ? 
                  `<strong>${company_name}</strong> şirketi adına PAFTA İş Yönetim Sistemi'ne kaydolduğunuz için teşekkür ederiz.` : 
                  'PAFTA İş Yönetim Sistemi\'ne kaydolduğunuz için teşekkür ederiz.'
                }
              </div>
              
              <div class="description">
                Hesabınızı aktifleştirerek iş süreçlerinizi dijitalleştirmeye ve verimliliğinizi artırmaya hemen başlayabilirsiniz.
              </div>
              
              <!-- CTA Button -->
              <div class="cta-section">
                <a href="${confirmLink}" class="cta-button">
                  Hesabımı Aktifleştir
                </a>
              </div>
              
              <!-- Features -->
              <hr class="divider">
              
              <div class="features-title">Hemen başlayabilirsiniz:</div>
              
              <div class="features-grid">
                <div class="feature-item">
                  <div class="feature-icon">👥</div>
                  <div class="feature-text">Müşteri Yönetimi</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">💰</div>
                  <div class="feature-text">Finansal Takip</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">📊</div>
                  <div class="feature-text">Satış Fırsatları</div>
                </div>
                <div class="feature-item">
                  <div class="feature-icon">🔧</div>
                  <div class="feature-text">Servis Yönetimi</div>
                </div>
              </div>
              
              <hr class="divider">
              
              <!-- Security Note -->
              <div class="security-note">
                <div class="security-text">
                  🔒 Bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle göz ardı edebilirsiniz.
                </div>
              </div>
              
              <!-- Alternative Link -->
              <div class="alternative-section">
                <div class="alternative-text">
                  Buton çalışmıyorsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:
                </div>
                <div class="link-text">
                  ${confirmLink}
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-text">
                Sorularınız için: <a href="mailto:destek@pafta.app" class="footer-link">destek@pafta.app</a>
              </div>
              <div class="footer-brand">
                © 2024 PAFTA İş Yönetim Sistemi
              </div>
            </div>
          </div>
        </body>
        </html>
      `
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