import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";

// Genel CORS başlıkları
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Uygulama URL'i (redirect için zorunlu)
// Not: Lovable ortamında env değişkenleri kullanılamaz, bu nedenle sabit URL kullanıyoruz
const APP_URL = "https://527a7790-65f5-4ba3-87eb-7299d2f3415a.sandbox.lovable.dev";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Sadece POST desteklenir" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { email, inviting_company_id, company_name } = body as {
      email?: string;
      inviting_company_id?: string;
      company_name?: string;
    };

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email gereklidir" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Supabase service role client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Şirket adını belirle (id varsa DB'den çek, yoksa gönderilen ya da varsayılan)
    let companyName = company_name || "Şirketiniz";
    if (inviting_company_id) {
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("name")
        .eq("id", inviting_company_id)
        .maybeSingle();

      if (companyError) {
        console.error("Şirket bilgisi alınamadı:", companyError);
      }
      if (companyData?.name) companyName = companyData.name;
    }

    // Kullanıcı/profil var mı kontrol et
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (profileError) {
      console.error("Profil kontrol hatası:", profileError);
      return new Response(
        JSON.stringify({ error: "Profil kontrolü sırasında hata oluştu" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resend hazırla
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    if (existingProfile) {
      // Mevcut kullanıcı: recovery linki üret ve InviteSetup'a yönlendir
      const { data: recoveryData, error: recoveryError } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${APP_URL}/invite-setup?email=${encodeURIComponent(email)}`,
        },
      });

      if (recoveryError || !recoveryData?.properties?.action_link) {
        console.error("Recovery link hatası:", recoveryError);
        return new Response(
          JSON.stringify({ error: "Şifre sıfırlama bağlantısı oluşturulamadı" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const resetUrl = recoveryData.properties.action_link;
      const emailResponse = await resend.emails.send({
        from: "Pafta <noreply@pafta.app>",
        to: [email],
        subject: `${companyName} şirketine davet edildiniz`,
        html: `
          <h1>Merhaba!</h1>
          <p>${companyName} şirketine davet edildiniz.</p>
          <p>Hesabınız zaten bulunduğu için aşağıdaki bağlantı ile şifrenizi belirleyin:</p>
          <a href="${resetUrl}" style="background-color:#0F62FE;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">Şifremi Belirle</a>
          <p>Bağlantı kısa süreliğine geçerlidir.</p>
        `,
      });

      if ((emailResponse as any)?.error) {
        console.error("Resend e-posta hatası:", (emailResponse as any).error);
        return new Response(
          JSON.stringify({ error: "E-posta gönderilemedi" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: `${email} adresine şifre belirleme maili gönderildi` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Yeni kullanıcı: invite linki üret ve InviteSetup'a yönlendir
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.generateLink({
        type: "invite",
        email,
        options: {
          redirectTo: `${APP_URL}/invite-setup?email=${encodeURIComponent(email)}`,
          data: inviting_company_id
            ? { invited_by_company_id: inviting_company_id, company_name: companyName }
            : { company_name: companyName },
        },
      });

      if (inviteError || !inviteData?.properties?.action_link) {
        console.error("Invite linki oluşturulamadı:", inviteError);
        return new Response(
          JSON.stringify({ error: "Davet bağlantısı oluşturulamadı" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const inviteUrl = inviteData.properties.action_link;
      const emailResponse = await resend.emails.send({
        from: "Pafta <noreply@pafta.app>",
        to: [email],
        subject: `${companyName} şirketine davet edildiniz`,
        html: `
          <h1>Merhaba!</h1>
          <p>${companyName} şirketine davet edildiniz.</p>
          <p>Hesabınızı oluşturmak ve şifrenizi belirlemek için aşağıdaki bağlantıya tıklayın:</p>
          <a href="${inviteUrl}" style="background-color:#0F62FE;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">Hesabımı Kur</a>
          <p>Bağlantı kısa süreliğine geçerlidir.</p>
        `,
      });

      if ((emailResponse as any)?.error) {
        console.error("Resend e-posta hatası:", (emailResponse as any).error);
        return new Response(
          JSON.stringify({ error: "E-posta gönderilemedi" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: `${email} adresine davet e-postası gönderildi` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("invite-user hata:", error);
    return new Response(
      JSON.stringify({ error: "Sunucu hatası" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
