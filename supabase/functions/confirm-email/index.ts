import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');

    console.log('Confirm email request:', { token: token ? 'present' : 'missing', type });

    if (!token) {
      console.error('Missing token parameter');
      return new Response('Token parametresi eksik', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Email confirmation için type kontrolü
    if (type !== 'email') {
      console.error('Invalid type parameter:', type);
      return new Response('Geçersiz tip parametresi', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Token'ı kullanarak email_confirmations tablosundan veriyi al
    const { data: confirmationData, error: confirmError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', token)
      .eq('used_at', null)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (confirmError || !confirmationData) {
      console.error('Token validation error:', confirmError);
      return new Response('Geçersiz veya süresi dolmuş token', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Token validated for user:', confirmationData.user_id);

    // Token'ı kullanılmış olarak işaretle
    const { error: updateTokenError } = await supabase
      .from('email_confirmations')
      .update({ used_at: new Date().toISOString() })
      .eq('id', confirmationData.id);

    if (updateTokenError) {
      console.error('Error updating token:', updateTokenError);
      return new Response('Token güncellenirken hata oluştu', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    // Users tablosunda is_active'i true yap
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', confirmationData.user_id);

    if (updateUserError) {
      console.error('Error updating user:', updateUserError);
      return new Response('Kullanıcı güncellenirken hata oluştu', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log('User activated successfully:', confirmationData.user_id);

    // Başarılı durumda signin sayfasına yönlendir
    const redirectUrl = `${url.origin}/signin?confirmed=true`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('Unexpected error in confirm-email function:', error);
    return new Response('Sunucu hatası', {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});