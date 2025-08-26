import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { SignJWT } from "https://esm.sh/jose@4.15.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('🚀 custom-login edge function başladı');
  console.log('🔗 Request URL:', req.url);
  console.log('📝 Request method:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight response');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();
    console.log('📧 Login attempt for email:', email);

    if (!email || !password) {
      console.log('❌ Email veya şifre eksik');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email ve şifre gereklidir' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Supabase client oluşturuluyor...');
    // Supabase client'ı service role ile oluştur
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Kullanıcı aranıyor...');
    // Kullanıcıyı bul
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('❌ Kullanıcı arama hatası:', userError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Giriş işlemi başarısız' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!user) {
      console.log('❌ Kullanıcı bulunamadı');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email veya şifre hatalı' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('👤 Kullanıcı bulundu:', user.email);

    // Kullanıcının aktif olup olmadığını kontrol et
    if (!user.is_active) {
      console.log('❌ Kullanıcı aktif değil');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Hesabınız aktif değil. Lütfen e-postanızı kontrol ederek hesabınızı onaylayın.',
          requiresConfirmation: true 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔐 Şifre kontrol ediliyor...');
    // Şifreyi kontrol et (crypto API kullanarak)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const storedHash = (user.password_hash || '').trim();
    console.log('🔍 Stored hash length:', storedHash.length);
    console.log('🔍 Calculated hash length:', hashedPassword.length);
    
    // Şifre kontrolü - hem düz metin hem SHA-256
    let passwordValid = false;
    
    // Önce düz metin karşılaştırması (geçici)
    if (password === storedHash) {
      passwordValid = true;
      console.log('✅ Düz metin şifre eşleşti');
    } else {
      // SHA-256 karşılaştırması
      passwordValid = hashedPassword.toLowerCase() === storedHash.toLowerCase();
      console.log('🔍 SHA-256 şifre eşleşti:', passwordValid);
    }
    
    if (!passwordValid) {
      console.log('❌ Şifre hatalı');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email veya şifre hatalı' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Şifre doğru');

    // Önce Supabase auth.users tablosunda bu kullanıcı var mı kontrol et
    console.log('🔍 Supabase auth.users kontrolü...');
    const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
    
    let authUser = null;
    if (!authUsersError && authUsers?.users) {
      authUser = authUsers.users.find((u: any) => u.email === email);
    }
    
    let supabaseSession = null;
    
    if (!authUser) {
      console.log('🆕 Supabase auth.users\'da kullanıcı yok, oluşturuluyor...');
      // Supabase auth.users'da kullanıcı yoksa oluştur
      const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password, // Orijinal şifreyi kullan
        email_confirm: true, // Email onaylanmış olarak işaretle
        user_metadata: {
          full_name: user.full_name || user.company_name,
          custom_user_id: user.id, // Custom user ID'yi metadata'da sakla
          project_id: user.project_id
        }
      });
      
      if (createError) {
        console.error('❌ Supabase auth user oluşturma hatası:', createError);
      } else {
        console.log('✅ Supabase auth user oluşturuldu:', newAuthUser.user?.id);
        authUser = newAuthUser.user;
      }
    }
    
    if (authUser) {
      console.log('🔐 Supabase session oluşturuluyor...');
      // Supabase session oluştur (RLS için gerekli)
      try {
        // signInWithPassword kullanarak gerçek session oluştur
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (authError) {
          console.error('❌ Supabase auth signIn hatası:', authError);
        } else if (authData?.session) {
          console.log('✅ Supabase session oluşturuldu');
          supabaseSession = {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            user: authData.user
          };
        }
      } catch (signInError) {
        console.error('❌ Supabase signIn exception:', signInError);
      }
    }

    // Custom session token oluştur (backward compatibility için)
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 saat geçerli

    console.log('🎫 Custom session token oluşturuluyor...');
    // Session kaydet
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        project_id: user.project_id
      });

    if (sessionError) {
      console.error('❌ Session kaydetme hatası:', sessionError);
      console.log('⚠️ Session kaydedilemedi ama login devam ediyor');
    } else {
      console.log('✅ Session kaydedildi');
    }

    console.log('📊 Son giriş tarihi güncelleniyor...');
    // Kullanıcının son giriş tarihini güncelle
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    console.log('✅ Login başarılı!');
    
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
      console.log('✅ Projeler alındı:', { projectIds, defaultProjectId });
    } catch (e) {
      console.error('⚠️ user_projects sorgu hatası:', e);
    }

    // Başarılı yanıt - hassas bilgileri çıkar
    const { password_hash, ...safeUser } = user;
    
    // Supabase uyumlu JWT üret (GoTrue başarısızsa RLS için)
    const supabaseJwtPayload = {
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      user_metadata: {
        custom_user_id: user.id,
        project_id: user.project_id,
        full_name: user.full_name || user.company_name || ''
      }
    };

    let supabaseJwt: string | null = null;
    try {
      const secret = new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET') || Deno.env.get('JWT_SECRET_KEY') || '');
      if (secret.byteLength > 0) {
        supabaseJwt = await new SignJWT(supabaseJwtPayload)
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('24h')
          .setIssuer('supabase')
          .sign(secret);
      } else {
        console.warn('⚠️ Missing SUPABASE_JWT_SECRET - cannot sign JWT');
      }
    } catch (e) {
      console.error('❌ JWT signing error:', e);
    }
    
    const response = {
      success: true,
      user: safeUser,
      session_token: sessionToken,
      project_ids: projectIds,
      default_project_id: defaultProjectId,
      // Supabase session bilgilerini de ekle (RLS için gerekli)
      supabase_session: supabaseSession,
      supabase_jwt: supabaseJwt,
      auth_user_id: authUser?.id || null
    };

    console.log('✅ Response hazırlanıyor:', response);
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Login function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Sunucu hatası',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});