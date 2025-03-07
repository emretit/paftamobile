
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseInvoice, InvoiceStatus } from "@/types/purchase";
import { toast } from "sonner";

export const usePurchaseInvoices = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "" as string,
    search: "",
    dateRange: { from: null, to: null } as { from: Date | null, to: null }
  });

  const fetchPurchaseInvoices = async (): Promise<PurchaseInvoice[]> => {
    let query = supabase
      .from("purchase_invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status as InvoiceStatus);
    }

    if (filters.search) {
      query = query.or(`invoice_number.ilike.%${filters.search}%`);
    }

    if (filters.dateRange.from) {
      query = query.gte("created_at", filters.dateRange.from.toISOString());
    }

    if (filters.dateRange.to) {
      query = query.lte("created_at", filters.dateRange.to.toISOString());
    }

    const { data, error } = await query;
    
    if (error) {
      toast.error("Faturalar yüklenirken hata oluştu");
      throw error;
    }
    
    return data;
  };

  const fetchPurchaseInvoiceById = async (id: string): Promise<PurchaseInvoice> => {
    const { data, error } = await supabase
      .from("purchase_invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Fatura yüklenirken hata oluştu");
      throw error;
    }

    return data;
  };

  const createPurchaseInvoice = async (invoiceData: any) => {
    const { data, error } = await supabase
      .from("purchase_invoices")
      .insert([invoiceData])
      .select()
      .single();

    if (error) {
      toast.error("Fatura oluşturulurken hata oluştu");
      throw error;
    }

    toast.success("Fatura başarıyla oluşturuldu");
    return data;
  };

  const updatePurchaseInvoice = async ({ id, data }: { id: string, data: Partial<PurchaseInvoice> }) => {
    const { error } = await supabase
      .from("purchase_invoices")
      .update(data)
      .eq("id", id);

    if (error) {
      toast.error("Fatura güncellenirken hata oluştu");
      throw error;
    }

    toast.success("Fatura başarıyla güncellendi");
    return { id };
  };

  const updateInvoiceStatus = async ({ id, status }: { id: string, status: InvoiceStatus }) => {
    const { error } = await supabase
      .from("purchase_invoices")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Fatura durumu güncellenirken hata oluştu");
      throw error;
    }

    toast.success("Fatura durumu başarıyla güncellendi");
    return { id };
  };

  const registerPayment = async ({ id, amount }: { id: string, amount: number }) => {
    // Get current invoice to check the current paid amount
    const { data: invoice, error: fetchError } = await supabase
      .from("purchase_invoices")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) {
      toast.error("Fatura bilgileri alınırken hata oluştu");
      throw fetchError;
    }
    
    const newPaidAmount = invoice.paid_amount + amount;
    const newStatus: InvoiceStatus = 
      newPaidAmount >= invoice.total_amount 
        ? 'paid' 
        : newPaidAmount > 0 
          ? 'partially_paid' 
          : 'pending';
    
    const { error } = await supabase
      .from("purchase_invoices")
      .update({ 
        paid_amount: newPaidAmount,
        status: newStatus
      })
      .eq("id", id);

    if (error) {
      toast.error("Ödeme kaydedilirken hata oluştu");
      throw error;
    }

    toast.success("Ödeme başarıyla kaydedildi");
    return { id };
  };

  const deletePurchaseInvoice = async (id: string) => {
    const { error } = await supabase
      .from("purchase_invoices")
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
    queryKey: ['purchaseInvoices', filters],
    queryFn: fetchPurchaseInvoices,
  });

  const getInvoice = (id: string) => {
    return useQuery({
      queryKey: ['purchaseInvoice', id],
      queryFn: () => fetchPurchaseInvoiceById(id),
    });
  };

  const createInvoiceMutation = useMutation({
    mutationFn: createPurchaseInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: updatePurchaseInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateInvoiceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
    },
  });

  const registerPaymentMutation = useMutation({
    mutationFn: registerPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: deletePurchaseInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
    getInvoice,
    createInvoiceMutation,
    updateInvoiceMutation,
    updateStatusMutation,
    registerPaymentMutation,
    deleteInvoiceMutation,
  };
};
