import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('AUTH_HOOK_SECRET') as string;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    console.log('Received webhook payload:', { headers: Object.keys(headers) });
    
    // Verify webhook signature if secret is configured
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      try {
        wh.verify(payload, headers);
      } catch (err) {
        console.error('Webhook verification failed:', err);
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }
    }

    const data = JSON.parse(payload);
    const { user, email_data } = data;

    if (!user?.email) {
      console.error('No user email found in payload');
      return new Response('No user email found', { status: 400, headers: corsHeaders });
    }

    console.log('Processing email for user:', user.email);

    // Generate email content based on email type
    const { token, token_hash, redirect_to, email_action_type } = email_data;
    
    let subject = '';
    let htmlContent = '';
    
    if (email_action_type === 'signup') {
      subject = 'PAFTA.APP - Hesabınızı Onaylayın';
      const confirmUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${encodeURIComponent(redirect_to || 'https://pafta.app/')}`;
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">PAFTA.APP</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">İş Yönetimi Platformu</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Hoş geldiniz!</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
              PAFTA.APP'e kaydolduğunuz için teşekkür ederiz. Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Hesabımı Onayla
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.5; margin-top: 25px;">
              Bu bağlantı 24 saat boyunca geçerlidir. Eğer bu e-postayı siz istemediyseniz, güvenle görmezden gelebilirsiniz.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">
            
            <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
              © 2025 PAFTA.APP - Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      `;
    } else if (email_action_type === 'recovery') {
      subject = 'PAFTA.APP - Şifre Sıfırlama';
      const resetUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=recovery&redirect_to=${encodeURIComponent(redirect_to || 'https://pafta.app/')}`;
      
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">PAFTA.APP</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Şifre Sıfırlama</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Şifrenizi Sıfırlayın</h2>
            
            <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
              Şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);">
                Şifremi Sıfırla
              </a>
            </div>
            
            <p style="color: #718096; font-size: 14px; line-height: 1.5; margin-top: 25px;">
              Bu bağlantı 1 saat boyunca geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı güvenle görmezden gelebilirsiniz.
            </p>
          </div>
        </div>
      `;
    } else {
      // Fallback for other email types
      subject = 'PAFTA.APP - Bildirim';
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>PAFTA.APP</h1>
          <p>Bu e-posta PAFTA.APP uygulamasından gönderilmiştir.</p>
        </div>
      `;
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: 'PAFTA.APP <noreply@pafta.app>',
      to: [user.email],
      subject: subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error in send-auth-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
});