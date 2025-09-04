// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    console.log("🚀 Edge function started");
    
    // ---- ENV & clients ----
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("🔧 Environment check:", {
      hasUrl: !!SUPABASE_URL,
      hasAnonKey: !!SUPABASE_ANON_KEY,
      hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
    });
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase env vars");
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    // ---- Auth ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Missing or invalid Authorization");
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authErr } = await userClient.auth.getUser(token);
    if (authErr || !authData?.user) throw new Error("Invalid user token");
    const userId = authData.user.id;

    // ---- Body ----
    const { salesInvoiceId } = await req.json();
    if (!salesInvoiceId) throw new Error("salesInvoiceId is required");

    // ---- Profile & company ----
    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .single();
    if (pErr || !profile?.company_id) throw new Error("User profile or company not found");
    const companyId = profile.company_id as string;

    // ---- Idempotent lock (sending) ----
    // Requires a unique index on (company_id, sales_invoice_id)
    const nowIso = new Date().toISOString();
    // Upsert to set 'sending' if no active record, else read current status
    const { data: existing, error: exErr } = await admin
      .from("einvoice_status_tracking")
      .select("id,status, nilvera_invoice_id, sent_at")
      .eq("company_id", companyId)
      .eq("sales_invoice_id", salesInvoiceId)
      .maybeSingle();

    if (exErr) throw new Error("Tracking check failed");

    if (existing) {
      if (["sending", "sent", "delivered", "accepted"].includes(existing.status)) {
        const status = existing.status;
        const payload: any = {
          success: status !== "sending",
          status,
          nilvera_invoice_id: existing.nilvera_invoice_id ?? null,
          sent_at: existing.sent_at ?? null,
        };
        return new Response(JSON.stringify(payload), {
          status: status === "sending" ? 409 : 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // set to sending
      const { error: updErr } = await admin
        .from("einvoice_status_tracking")
        .update({
          status: "sending",
          transfer_state: 0,
          invoice_state: 0,
          sent_at: nowIso,
          error_message: null,
          error_code: null,
        })
        .eq("id", existing.id);
      if (updErr) throw new Error("Failed to lock invoice (update)");
    } else {
      const { error: insErr } = await admin.from("einvoice_status_tracking").insert({
        company_id: companyId,
        sales_invoice_id: salesInvoiceId,
        status: "sending",
        transfer_state: 0,
        invoice_state: 0,
        sent_at: nowIso,
        error_message: null,
        error_code: null,
      });
      if (insErr) throw new Error("Failed to lock invoice (insert)");
    }

    // ---- Nilvera auth ----
    const { data: nilveraAuth, error: aErr } = await admin
      .from("nilvera_auth")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .single();
    if (aErr || !nilveraAuth?.api_key) throw new Error("Nilvera credentials not found");
    const NILVERA_KEY = nilveraAuth.api_key as string;
    const TEST_MODE = !!nilveraAuth.test_mode;
    const BASE = TEST_MODE ? "https://apitest.nilvera.com" : "https://api.nilvera.com";

    // ---- Load invoice + joins ----
    const { data: invoice, error: invErr } = await admin
      .from("sales_invoices")
      .select(`
        *,
        customers:customers(*),
        companies:companies(*),
        items:sales_invoice_items(*)
      `)
      .eq("id", salesInvoiceId)
      .eq("company_id", companyId)
      .single();
    if (invErr || !invoice) throw new Error("Sales invoice not found");

    // ---- Validate minimal fields ----
    if (!invoice?.customers?.tax_number) throw new Error("Customer tax number missing");
    if (!invoice?.companies?.tax_number) throw new Error("Company tax number missing");

    // ---- Alias (only if e-fatura mükellefi) ----
    let customerAlias: string | null = null;
    if (invoice.customers?.is_einvoice_mukellef) {
      const dbAlias = (invoice.customers?.einvoice_alias_name ?? "").toString().trim();
      if (dbAlias) customerAlias = dbAlias.startsWith("urn:mail:") ? dbAlias : `urn:mail:${dbAlias}`;
      if (!customerAlias) {
        // Alias yoksa burada "e-Arşiv"e yönlendirme ya da hata; biz hata veriyoruz:
        throw new Error("E-fatura mükellefi için CustomerAlias zorunlu");
      }
    }

    // ---- InvoiceSerieOrNumber ----
    // Nilvera kurallarına göre: 16 haneli tam numara VEYA 3 harfli seri
    // Biz 3 harfli seri kullanacağız, Nilvera kendi numaralandırmasını yapacak
    const invoiceSerieOrNumber = 'FAT'; // 3 harfli seri - Nilvera otomatik numara üretecek

    // ---- Build Nilvera EInvoice model ----
    const toNumber = (v: any, def = 0) => (v == null || v === "" ? def : Number(v));
    const issueDate = (invoice.fatura_tarihi
      ? new Date(invoice.fatura_tarihi)
      : new Date()
    ).toISOString().slice(0, 10); // YYYY-MM-DD

    const EInvoicePayload: any = {
      EInvoice: {
        InvoiceInfo: {
          UUID: crypto.randomUUID?.() ?? `uuid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          InvoiceType: "SATIS",
          CurrencyCode: invoice.para_birimi || "TRY",
          ExchangeRate: 1,
          InvoiceProfile: invoice.customers?.is_einvoice_mukellef ? "TICARIFATURA" : "TEMELFATURA",
          IssueDate: issueDate,
          ...(invoiceSerieOrNumber ? { InvoiceSerieOrNumber: invoiceSerieOrNumber } : {}),
        },
        CompanyInfo: {
          TaxNumber: invoice.companies?.tax_number,
          Name: invoice.companies?.name ?? "",
          Address: invoice.companies?.address ?? "",
          District: "Merkez",
          City: "İstanbul",
          Country: "Türkiye",
          Phone: invoice.companies?.phone ?? "",
          Mail: invoice.companies?.email ?? "",
        },
        CustomerInfo: {
          TaxNumber: invoice.customers?.tax_number,
          Name: invoice.customers?.name || invoice.customers?.company || "",
          TaxOffice: invoice.customers?.tax_office ?? "",
          Address: invoice.customers?.address ?? "-",
          District: invoice.customers?.district || invoice.customers?.city || "Merkez",
          City: invoice.customers?.city || "İstanbul",
          Country: "Türkiye",
          Phone: invoice.customers?.mobile_phone || invoice.customers?.office_phone || "",
          Mail: invoice.customers?.email || "",
        },
        InvoiceLines: (invoice.items ?? []).map((it: any) => ({
          Name: it.urun_adi,
          Description: it.aciklama || "",
          Quantity: toNumber(it.miktar, 1),
          UnitType: "C62", // UBL-TR (adet)
          Price: toNumber(it.birim_fiyat),
          KDVPercent: toNumber(it.kdv_orani, 0),
          DiscountPercent: toNumber(it.indirim_orani, 0),
          LineTotal: toNumber(it.satir_toplami),
        })),
        Notes: invoice.notlar ? [invoice.notlar] : [],
      },
      ...(customerAlias ? { CustomerAlias: customerAlias } : {}),
    };

    // ---- Call Nilvera ----
    const url = `${BASE}/einvoice/Send/Model`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NILVERA_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(EInvoicePayload),
    });

    // If error, read text to log and return semantic status
    if (!resp.ok) {
      const text = await resp.text();
      await admin
        .from("einvoice_status_tracking")
        .update({
          status: "error",
          error_message: text?.slice(0, 1000) ?? `HTTP ${resp.status}`,
          error_code: `HTTP_${resp.status}`,
          nilvera_response: null,
        })
        .eq("company_id", companyId)
        .eq("sales_invoice_id", salesInvoiceId);

      const status = [401, 403].includes(resp.status) ? 401
        : resp.status === 404 ? 404
        : resp.status === 409 ? 409
        : 400;

      return new Response(JSON.stringify({
        success: false,
        status: "error",
        message: "Nilvera API error",
        detail: text,
      }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await resp.json();

    // ---- Persist success ----
    await admin
      .from("einvoice_status_tracking")
      .update({
        nilvera_invoice_id: result.id ?? result.uuid ?? null,
        nilvera_transfer_id: result.transferId ?? null,
        status: "sent",
        transfer_state: result.transferState ?? 0,
        invoice_state: result.invoiceState ?? 0,
        sent_at: new Date().toISOString(),
        nilvera_response: result, // jsonb
        error_message: null,
        error_code: null,
      })
      .eq("company_id", companyId)
      .eq("sales_invoice_id", salesInvoiceId);

    // (opsiyonel) satış faturasında durum & fatura_no güncelle
    const u: any = { durum: "gonderildi", xml_data: result };
    if (result.invoiceNumber || result.invoice_number) {
      u.fatura_no = result.invoiceNumber ?? result.invoice_number;
    }
    await admin.from("sales_invoices").update(u).eq("id", salesInvoiceId).eq("company_id", companyId);

    return new Response(JSON.stringify({
      success: true,
      message: "E-fatura Nilvera'ya gönderildi",
      nilveraInvoiceId: result.id ?? result.uuid ?? null,
      data: result,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    // Genel hata - detaylı logging
    console.error("❌ Edge function error:", err);
    console.error("❌ Error stack:", err?.stack);
    console.error("❌ Error name:", err?.name);
    console.error("❌ Error message:", err?.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: err?.message ?? "Unexpected error",
      errorType: err?.name ?? "UnknownError",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});