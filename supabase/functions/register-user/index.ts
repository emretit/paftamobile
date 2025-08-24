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
        const match = project.name.match(new RegExp(`^${company_name.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(?: #(\\d+))?$`));
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
    const confirmLink = `https://pafta.app/signin?token=${confirmationToken}`;

    const { error: sendError } = await resend.emails.send({
      from: 'PAFTA <noreply@pafta.app>',
      to: [email],
      subject: 'PAFTA İş Yönetim Sistemi - Hoş Geldiniz!',
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PAFTA - Hoş Geldiniz</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #ffffff;
              padding: 20px;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              border-radius: 12px;
              overflow: hidden;
            }
            
            .header {
              background-color: #ffffff;
              padding: 40px 30px 20px;
              text-align: center;
              border-bottom: 1px solid #f0f0f0;
            }
            
            .logo {
              width: 80px;
              height: 60px;
              background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
              border-radius: 16px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-family: 'Arial Black', 'Helvetica Bold', 'Impact', sans-serif;
              font-size: 20px;
              font-weight: 900;
              color: #D32F2F;
              margin-bottom: 16px;
              box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
              border: 3px solid #D32F2F;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
              letter-spacing: 1px;
            }
            
            .system-title {
              font-size: 20px;
              font-weight: 600;
              color: #333;
              margin: 0;
            }
            
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            
            .greeting {
              font-size: 28px;
              font-weight: 700;
              color: #333;
              margin-bottom: 20px;
              line-height: 1.2;
            }
            
            .welcome-message {
              font-size: 16px;
              color: #666;
              margin-bottom: 24px;
              line-height: 1.6;
            }
            
            .company-message {
              font-size: 16px;
              color: #666;
              margin-bottom: 40px;
              line-height: 1.6;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #D32F2F;
            }
            
            .cta-container {
              margin: 40px 0;
            }
            
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
              color: #ffffff;
              padding: 16px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
            }
            
            .sparkle {
              margin-right: 8px;
              font-size: 18px;
            }
            
            .footer {
              background-color: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #f0f0f0;
            }
            
            .footer-text {
              font-size: 14px;
              color: #999;
              margin: 0;
            }
            
            @media (max-width: 600px) {
              .email-container {
                margin: 10px;
                border-radius: 8px;
              }
              
              .header {
                padding: 30px 20px 15px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .greeting {
                font-size: 24px;
              }
              
              .cta-button {
                padding: 14px 28px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">PAFTA</div>
              <h1 class="system-title">İş Yönetim Sistemi</h1>
            </div>
            
            <div class="content">
              <h2 class="greeting">Hoş Geldiniz${full_name ? `, ${full_name}` : ''}! 🎉</h2>
              
              <div class="company-message">
                ${company_name ? `<strong>${company_name}</strong> şirketi adına PAFTA İş Yönetim Sistemi'ne kayıt olduğunuz için teşekkür ederiz!` : ''}
              </div>
              
              <p class="welcome-message">
                Hesabınızı aktifleştirmek ve platformumuzun tüm özelliklerinden yararlanmaya başlamak için aşağıdaki butona tıklayın.
              </p>
              
              <div class="cta-container">
                <a href="${confirmLink}" class="cta-button">
                  <span class="sparkle">✨</span>Hesabımı Aktifleştir<span class="sparkle">✨</span>
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                Bu e-posta, PAFTA hesap onay sistemi tarafından otomatik olarak gönderilmiştir.<br>
                Sorularınız için: <a href="mailto:destek@pafta.app" style="color: #D32F2F;">destek@pafta.app</a>
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