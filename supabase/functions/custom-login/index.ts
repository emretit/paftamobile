import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import bcrypt from 'npm:bcryptjs@2.4.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email ve şifre gereklidir' }),
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

    // Kullanıcıyı bul
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (error) {
      console.error('Kullanıcı sorgu hatası:', error);
    }

    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz email veya şifre' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Şifre kontrolü (SHA-256 veya bcrypt)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const storedHash = (user.password_hash || '').trim();
    let passwordValid = false;

    if (storedHash.startsWith('$2')) {
      // bcrypt formatı
      try {
        passwordValid = await bcrypt.compare(password, storedHash);
      } catch (e) {
        console.error('bcrypt karşılaştırma hatası:', e);
      }
    } else {
      // sha256 karşılaştırma
      passwordValid = sha256Hex.toLowerCase() === storedHash.toLowerCase();
    }
    
    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz email veya şifre' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Hesap aktif mi kontrol et
    if (!user.is_active) {
      return new Response(
        JSON.stringify({ error: 'Hesabınızı email ile onaylamanız gerekiyor' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Session token oluştur
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat

    // Session kaydet
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error('Session oluşturma hatası:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Giriş işlemi başarısız' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Last login güncelle
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Kullanıcının projelerini getir
    let defaultProjectId: string | null = null;
    let projectIds: string[] = [];
    try {
      const { data: userProjects } = await supabase
        .from('user_projects')
        .select('project_id')
        .eq('user_id', user.id);
      projectIds = userProjects?.map((p: any) => p.project_id) ?? [];
      defaultProjectId = projectIds[0] ?? null;
    } catch (e) {
      console.error('user_projects sorgu hatası:', e);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        session_token: sessionToken,
        project_ids: projectIds,
        default_project_id: defaultProjectId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});