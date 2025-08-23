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

    // Otomatik proje oluşturma ve kullanıcı aktifleştirme
    try {
      // 1. En son proje ID'sini al
      const { data: lastProject } = await supabase
        .from('projects')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 2. Yeni proje ID'si oluştur (UUID formatında ardışık)
      let newProjectId;
      if (lastProject && lastProject.id) {
        // Son proje ID'sinden sayısal kısmı çıkar ve +1 ekle
        const lastIdNum = parseInt(lastProject.id.split('-').pop() || '1', 16);
        const newIdNum = lastIdNum + 1;
        const newIdHex = newIdNum.toString(16).padStart(12, '0');
        newProjectId = `00000000-0000-0000-0000-${newIdHex}`;
      } else {
        // İlk proje ise 2 ile başla (1 default proje)
        newProjectId = '00000000-0000-0000-0000-000000000002';
      }

      // 3. Kullanıcı bilgilerini al
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', confirmation.user_id)
        .single();

      const userName = userData?.full_name || userData?.email?.split('@')[0] || 'User';
      const projectName = `${userName} Projesi`;

      // 4. Yeni proje oluştur
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          id: newProjectId,
          name: projectName,
          description: `${userName} için otomatik oluşturulan proje`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (projectError) {
        console.error('Proje oluşturma hatası:', projectError);
        throw new Error('Proje oluşturulamadı');
      }

      // 5. Kullanıcıyı aktifleştir ve proje ID'sini ekle
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          is_active: true,
          project_id: newProjectId
        })
        .eq('id', confirmation.user_id);

      if (userError) {
        console.error('Kullanıcı aktifleştirme hatası:', userError);
        throw new Error('Kullanıcı aktifleştirilemedi');
      }

      // 6. Kullanıcıyı projeye owner olarak ekle
      const { error: userProjectError } = await supabase
        .from('user_projects')
        .insert({
          user_id: confirmation.user_id,
          project_id: newProjectId,
          role: 'owner'
        });

      if (userProjectError) {
        console.error('User-project ilişki hatası:', userProjectError);
        throw new Error('Kullanıcı-proje ilişkisi oluşturulamadı');
      }

      console.log(`Yeni proje oluşturuldu: ${newProjectId} - ${projectName}`);

    } catch (error) {
      console.error('Proje oluşturma sürecinde hata:', error);
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
      const frontendUrl = `https://pafta.app/signin?confirmed=true`;
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