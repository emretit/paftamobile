
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SalesInvoice {
  id: string;
  fatura_no: string;
  musteri_id: string;
  document_type: 'fatura' | 'e_fatura' | 'e_arsiv' | 'irsaliye' | 'makbuz' | 'serbest_meslek_makbuzu';
  fatura_tarihi: string;
  vade_tarihi: string;
  ara_toplam: number;
  kdv_toplami: number;
  toplam_tutar: number;
  odenen_tutar: number;
  odeme_durumu: 'odenmedi' | 'kismi_odendi' | 'odendi' | 'gecikti' | 'iptal';
  para_birimi: string;
  notes?: string;
  tevkifat_orani?: number;
  tevkifat_tutari?: number;
  teslim_sekli?: string;
  odeme_yontemi?: string;
  fiili_sevk_tarihi?: string;
  irsaliye_no?: string;
  vergi_dairesi?: string;
  vergi_no?: string;
  ettn?: string;
  proposal_id?: string;
  customer?: {
    name: string;
    tax_number?: string;
    company?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SalesInvoiceItem {
  id: string;
  fatura_id: string;
  urun_id?: string;
  aciklama: string;
  miktar: number;
  birim: string;
  birim_fiyat: number;
  iskonto_orani?: number;
  kdv_orani: number;
  tevkifat_kodu?: string;
  toplam_tutar: number;
  product?: {
    name: string;
    sku?: string;
  };
}

export const useSalesInvoices = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    dateRange: { from: null, to: null } as { from: Date | null, to: Date | null }
  });

  const fetchInvoices = async (): Promise<SalesInvoice[]> => {
    let query = supabase
      .from("sales_invoices")
      .select(`
        *,
        customer:musteri_id(name, tax_number, company)
      `)
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("odeme_durumu", filters.status);
    }

    if (filters.search) {
      query = query.or(`fatura_no.ilike.%${filters.search}%,customer.name.ilike.%${filters.search}%`);
    }

    if (filters.dateRange.from) {
      query = query.gte("fatura_tarihi", filters.dateRange.from.toISOString().split('T')[0]);
    }

    if (filters.dateRange.to) {
      query = query.lte("fatura_tarihi", filters.dateRange.to.toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    
    if (error) {
      toast.error("Faturalar yüklenirken hata oluştu");
      throw error;
    }
    
    return data;
  };

  const fetchInvoiceById = async (id: string): Promise<SalesInvoice> => {
    const { data, error } = await supabase
      .from("sales_invoices")
      .select(`
        *,
        customer:musteri_id(name, tax_number, company)
      `)
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Fatura yüklenirken hata oluştu");
      throw error;
    }

    return data;
  };
  
  const fetchInvoiceItems = async (invoiceId: string): Promise<SalesInvoiceItem[]> => {
    const { data, error } = await supabase
      .from("sales_invoice_items")
      .select(`
        *,
        product:urun_id(name, sku)
      `)
      .eq("fatura_id", invoiceId);

    if (error) {
      toast.error("Fatura kalemleri yüklenirken hata oluştu");
      throw error;
    }

    return data;
  };

  const createInvoice = async (invoiceData: Partial<SalesInvoice>, items: Partial<SalesInvoiceItem>[]) => {
    // First create the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("sales_invoices")
      .insert([invoiceData])
      .select()
      .single();

    if (invoiceError) {
      toast.error("Fatura oluşturulurken hata oluştu");
      throw invoiceError;
    }

    // Then create the invoice items
    if (items.length > 0) {
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        fatura_id: invoice.id
      }));

      const { error: itemsError } = await supabase
        .from("sales_invoice_items")
        .insert(itemsWithInvoiceId);

      if (itemsError) {
        toast.error("Fatura kalemleri oluşturulurken hata oluştu");
        throw itemsError;
      }
    }

    toast.success("Fatura başarıyla oluşturuldu");
    return invoice;
  };

  const updateInvoice = async ({ id, data }: { id: string, data: Partial<SalesInvoice> }) => {
    const { error } = await supabase
      .from("sales_invoices")
      .update(data)
      .eq("id", id);

    if (error) {
      toast.error("Fatura güncellenirken hata oluştu");
      throw error;
    }

    toast.success("Fatura başarıyla güncellendi");
    return { id };
  };

  const recordPayment = async ({ id, amount }: { id: string, amount: number }) => {
    // Get current invoice
    const { data: invoice, error: fetchError } = await supabase
      .from("sales_invoices")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) {
      toast.error("Fatura bilgisi alınamadı");
      throw fetchError;
    }
    
    // Calculate new paid amount and status
    const newPaidAmount = parseFloat(String(invoice.odenen_tutar)) + amount;
    let newStatus = 'odenmedi';
    
    if (newPaidAmount >= parseFloat(String(invoice.toplam_tutar))) {
      newStatus = 'odendi';
    } else if (newPaidAmount > 0) {
      newStatus = 'kismi_odendi';
    }
    
    // Update invoice
    const { error: updateError } = await supabase
      .from("sales_invoices")
      .update({
        odenen_tutar: newPaidAmount,
        odeme_durumu: newStatus
      })
      .eq("id", id);
    
    if (updateError) {
      toast.error("Ödeme kaydedilirken hata oluştu");
      throw updateError;
    }
    
    toast.success("Ödeme başarıyla kaydedildi");
    return { id };
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase
      .from("sales_invoices")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Fatura silinirken hata oluştu");
      throw error;
    }

    toast.success("Fatura başarıyla silindi");
    return { id };
  };

  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['salesInvoices', filters],
    queryFn: fetchInvoices,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: ({ invoice, items }: { invoice: Partial<SalesInvoice>, items: Partial<SalesInvoiceItem>[] }) => 
      createInvoice(invoice, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: updateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
    fetchInvoiceById,
    fetchInvoiceItems,
    createInvoiceMutation,
    updateInvoiceMutation,
    recordPaymentMutation,
    deleteInvoiceMutation,
  };
};
