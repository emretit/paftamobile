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

    // Supabase davet maili (şifre belirleme) gönder
    const appUrl = Deno.env.get('APP_URL') || 'https://pafta.app';
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          invited_by_company_id: inviting_company_id,
          company_name: companyData.name,
        },
        redirectTo: appUrl,
      } as any
    );

    if (inviteError) {
      // Kullanıcı zaten mevcutsa kurtarma maili gönder
      const alreadyExists = String(inviteError.message || '').toLowerCase().includes('already')
        || String(inviteError.name || '').toLowerCase().includes('exists');

      if (alreadyExists) {
        const { error: resendErr } = await (supabase as any).auth.resend({
          type: 'recovery',
          email,
          options: { redirectTo: appUrl }
        });
        if (resendErr) {
          console.error('Recovery maili gönderilemedi:', resendErr);
          return new Response(
            JSON.stringify({ error: 'Mevcut kullanıcı için mail gönderilemedi', details: resendErr.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ success: true, message: `${email} adresine şifre sıfırlama maili gönderildi` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Davet gönderme hatası:', inviteError);
      return new Response(
        JSON.stringify({ error: 'Davet gönderilemedi', details: inviteError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // Davet başarıyla gönderildi
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${email} adresine davet e-postası gönderildi`
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