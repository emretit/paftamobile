import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviting_company_id } = await req.json();

    if (!email || !inviting_company_id) {
      return new Response(
        JSON.stringify({ error: 'Email ve şirket bilgisi gereklidir' }),
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

    // Şirket bilgisini al
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', inviting_company_id)
      .single();

    if (companyError || !companyData) {
      return new Response(
        JSON.stringify({ error: 'Şirket bulunamadı' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Resend ile e-posta gönder
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const appUrl = 'https://527a7790-65f5-4ba3-87eb-7299d2f3415a.sandbox.lovable.dev';
    
    // Kullanıcının zaten var olup olmadığını kontrol et
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    if (existingUser?.user) {
      // Mevcut kullanıcı için şifre sıfırlama maili gönder
      const resetPasswordUrl = `${appUrl}/reset-password?email=${encodeURIComponent(email)}`;
      
      const emailResponse = await resend.emails.send({
        from: 'Pafta <noreply@pafta.app>',
        to: [email],
        subject: `${companyData.name} şirketine davet edildiniz`,
        html: `
          <h1>Merhaba!</h1>
          <p>${companyData.name} şirketine davet edildiniz.</p>
          <p>Zaten bir hesabınız olduğu için aşağıdaki bağlantıya tıklayarak şifrenizi sıfırlayabilirsiniz:</p>
          <a href="${resetPasswordUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
          <p>Bu bağlantı 24 saat geçerlidir.</p>
        `,
      });

      if (emailResponse.error) {
        console.error('Resend e-posta hatası:', emailResponse.error);
        return new Response(
          JSON.stringify({ error: 'E-posta gönderilemedi' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${email} adresine şifre sıfırlama maili gönderildi`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Yeni kullanıcı için kayıt ol bağlantısı gönder
      const signupUrl = `${appUrl}/signup?email=${encodeURIComponent(email)}&company_id=${inviting_company_id}&company_name=${encodeURIComponent(companyData.name)}`;
      
      const emailResponse = await resend.emails.send({
        from: 'Pafta <noreply@pafta.app>',
        to: [email],
        subject: `${companyData.name} şirketine davet edildiniz`,
        html: `
          <h1>Merhaba!</h1>
          <p>${companyData.name} şirketine davet edildiniz.</p>
          <p>Hesabınızı oluşturmak için aşağıdaki bağlantıya tıklayın:</p>
          <a href="${signupUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Hesap Oluştur</a>
          <p>Bu bağlantı 7 gün geçerlidir.</p>
        `,
      });

      if (emailResponse.error) {
        console.error('Resend e-posta hatası:', emailResponse.error);
        return new Response(
          JSON.stringify({ error: 'E-posta gönderilemedi' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${email} adresine davet e-postası gönderildi`
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Davet hatası:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});