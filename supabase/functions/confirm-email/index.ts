import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token gereklidir' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Token kontrolü
    const { data: confirmation, error } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', token)
      .eq('type', 'signup')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !confirmation) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz veya süresi dolmuş token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Kullanıcıyı aktifleştir
    const { error: userError } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', confirmation.user_id);

    if (userError) {
      console.error('Kullanıcı aktifleştirme hatası:', userError);
      return new Response(
        JSON.stringify({ error: 'Hesap aktifleştirme başarısız' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Token'ı kullanılmış olarak işaretle
    await supabase
      .from('email_confirmations')
      .update({ used_at: new Date().toISOString() })
      .eq('id', confirmation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Hesabınız başarıyla onaylandı. Artık giriş yapabilirsiniz.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Email onay hatası:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});