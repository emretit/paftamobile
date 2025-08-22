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
    const url = new URL(req.url);
    const method = req.method.toUpperCase();

    let token = '';
    if (method === 'GET') {
      token = url.searchParams.get('token') || '';
    } else if (method === 'POST') {
      const body = await req.json().catch(() => ({}));
      token = body.token || '';
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token gereklidir' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Token kontrolü
    const { data: confirmation, error } = await supabase
      .from('user_email_confirmations')
      .select('*')
      .eq('token', token)
      .eq('type', 'signup')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

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
      .from('user_email_confirmations')
      .update({ used_at: new Date().toISOString() })
      .eq('id', confirmation.id);

    if (method === 'GET') {
      // Frontend'e yönlendir
      const frontendUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'http://localhost:5173'}/signup?confirmed=true`;
      return new Response(null, { 
        status: 302, 
        headers: { 
          ...corsHeaders, 
          'Location': frontendUrl 
        } 
      });
    }

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