
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseInvoice, PurchaseInvoiceFormData, InvoiceStatus } from "@/types/purchase";
import { toast } from "sonner";

export const usePurchaseInvoices = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    supplier: "",
    dateRange: { from: null, to: null } as { from: Date | null, to: Date | null }
  });

  const fetchPurchaseInvoices = async (): Promise<PurchaseInvoice[]> => {
    let query = supabase
      .from("purchase_invoices")
      .select("*, suppliers(name), purchase_orders(po_number)")
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.search) {
      query = query.or(`invoice_number.ilike.%${filters.search}%`);
    }

    if (filters.supplier) {
      query = query.eq("supplier_id", filters.supplier);
    }

    if (filters.dateRange.from) {
      query = query.gte("invoice_date", filters.dateRange.from.toISOString());
    }

    if (filters.dateRange.to) {
      query = query.lte("invoice_date", filters.dateRange.to.toISOString());
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
      .select("*, suppliers(name, email, address, mobile_phone, company), purchase_orders(po_number)")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Fatura yüklenirken hata oluştu");
      throw error;
    }

    return data;
  };

  const createPurchaseInvoice = async (invoiceData: PurchaseInvoiceFormData) => {
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

  const updatePurchaseInvoice = async ({ id, data }: { id: string, data: Partial<PurchaseInvoiceFormData> }) => {
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

  const recordPayment = async ({ id, amount }: { id: string, amount: number }) => {
    // Get current invoice data
    const { data: invoice, error: fetchError } = await supabase
      .from("purchase_invoices")
      .select("total_amount, paid_amount, status")
      .eq("id", id)
      .single();

    if (fetchError) {
      toast.error("Fatura bilgileri alınırken hata oluştu");
      throw fetchError;
    }

    // Calculate new paid amount
    const newPaidAmount = parseFloat(invoice.paid_amount) + amount;
    
    // Determine new status
    let newStatus: InvoiceStatus = invoice.status;
    if (newPaidAmount >= parseFloat(invoice.total_amount)) {
      newStatus = "paid";
    } else if (newPaidAmount > 0) {
      newStatus = "partially_paid";
    }

    // Update the invoice
    const { error: updateError } = await supabase
      .from("purchase_invoices")
      .update({ 
        paid_amount: newPaidAmount, 
        status: newStatus 
      })
      .eq("id", id);

    if (updateError) {
      toast.error("Ödeme kaydedilirken hata oluştu");
      throw updateError;
    }

    // Create payment record in bank_transactions if needed
    // This would be implemented based on how your payment system works

    toast.success("Ödeme başarıyla kaydedildi");
    return { id, newPaidAmount, newStatus };
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

  const getInvoiceById = (id: string) => {
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

  const recordPaymentMutation = useMutation({
    mutationFn: recordPayment,
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
    getInvoiceById,
    createInvoiceMutation,
    updateInvoiceMutation,
    updateStatusMutation,
    recordPaymentMutation,
    deleteInvoiceMutation,
  };
};
