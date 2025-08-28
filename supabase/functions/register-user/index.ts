import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-project-id, x-user-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

    // Supabase Auth üzerinde kullanıcıyı oluştur (SMTP bağımlılığını kaldırmak için email_confirm = true)
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, company_name }
    });

    if (createUserError) {
      console.error('Auth user oluşturma hatası:', createUserError);
      return new Response(
        JSON.stringify({ error: 'Kullanıcı oluşturulamadı', details: createUserError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Opsiyonel hoş geldiniz e-postası (Resend). Başarısız olursa kaydı bozmayız.
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        const signinLink = `https://pafta.app/signin`;
        await resend.emails.send({
          from: 'PAFTA <noreply@pafta.app>',
          to: [email],
          subject: 'PAFTA İş Yönetim Sistemi - Hoş Geldiniz!',
          html: `Merhaba${full_name ? ` ${full_name}` : ''}, hesabınız oluşturuldu. Giriş için: <a href="${signinLink}">${signinLink}</a>`,
        });
      } else {
        console.warn('RESEND_API_KEY yok, hoş geldiniz e-postası atlanıyor.');
      }
    } catch (e) {
      console.warn('Hoş geldiniz e-postası gönderilemedi:', e);
    }

    // Başarılı yanıt
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Kayıt başarılı. Giriş yapabilirsiniz.',
        user: {
          id: createdUser?.user?.id,
          email: createdUser?.user?.email,
          full_name,
        }
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