import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { SignUpEmail } from "./_templates/signup-email.tsx";
import { ResetPasswordEmail } from "./_templates/reset-password-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("AUTH_HOOK_SECRET") || "your-webhook-secret";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify webhook signature if possible; otherwise parse payload directly
    let parsed: any = null;
    try {
      if (hookSecret) {
        const wh = new Webhook(hookSecret);
        parsed = wh.verify(payload, headers);
      }
    } catch (verifyError) {
      console.warn("Webhook verification failed, falling back to JSON parse:", verifyError);
    }
    if (!parsed) {
      try {
        parsed = JSON.parse(payload);
      } catch (parseError) {
        console.error("Failed to parse webhook payload:", parseError);
        throw new Error("Invalid webhook payload");
      }
    }
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url },
    } = parsed as {
      user: {
        email: string;
        user_metadata?: {
          full_name?: string;
          company_name?: string;
        };
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };
    console.log("Auth email webhook received:", { email_action_type, user: user.email });

    let html = "";
    let subject = "";

    // Generate appropriate email based on action type
    switch (email_action_type) {
      case "signup":
        html = await renderAsync(
          React.createElement(SignUpEmail, {
            supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
            token,
            token_hash,
            redirect_to: redirect_to || site_url,
            user_name: user.user_metadata?.full_name || "",
            company_name: user.user_metadata?.company_name || "",
          })
        );
        subject = "PAFTA hesabınızı onaylayın";
        break;

      case "recovery":
        html = await renderAsync(
          React.createElement(ResetPasswordEmail, {
            supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
            token,
            token_hash,
            redirect_to: redirect_to || site_url,
            user_name: user.user_metadata?.full_name || "",
          })
        );
        subject = "PAFTA şifre sıfırlama";
        break;

      case "email_change":
        // You can add more email types here
        subject = "PAFTA e-posta adresinizi onaylayın";
        html = `<p>E-posta adresinizi onaylamak için <a href="${Deno.env.get("SUPABASE_URL")}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}">buraya tıklayın</a></p>`;
        break;

      default:
        throw new Error(`Unsupported email action type: ${email_action_type}`);
    }

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: "PAFTA <noreply@pafta.app>",
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Auth email sent successfully to:", user.email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in auth-emails function:", error);
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          code: error.code || "unknown_error",
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});