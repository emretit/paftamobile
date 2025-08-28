import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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

    // Kullanıcıyı oluştur (email_confirm = false, şifre belirleme için)
    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { 
        invited_by_company_id: inviting_company_id,
        company_name: companyData.name
      }
    });

    if (createUserError) {
      console.error('Kullanıcı oluşturma hatası:', createUserError);
      return new Response(
        JSON.stringify({ error: 'Kullanıcı oluşturulamadı', details: createUserError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Şifre belirleme linki gönder
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('/v1', '')}/auth/v1/verify?type=recovery&redirect_to=${encodeURIComponent('https://vwhwufnckpqirxptwncw.supabase.co')}`
      }
    });

    if (resetError) {
      console.error('Şifre belirleme linki hatası:', resetError);
      // Kullanıcıyı sil çünkü email gönderilemedi
      await supabase.auth.admin.deleteUser(createdUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Davet maili gönderilemedi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${email} adresine şifre belirleme maili gönderildi`,
        user: {
          id: createdUser?.user?.id,
          email: createdUser?.user?.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

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