import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { eInvoiceService, EInvoiceStatusTracking } from "@/services/eInvoiceService";

export const useEInvoice = () => {
  const queryClient = useQueryClient();

  // Direkt fatura gönderme
  const sendInvoiceMutation = useMutation({
    mutationFn: (salesInvoiceId: string) => eInvoiceService.sendInvoiceDirectly(salesInvoiceId),
    onSuccess: (success, salesInvoiceId) => {
      if (success) {
        toast.success("E-fatura başarıyla gönderildi");
        queryClient.invalidateQueries({ queryKey: ["einvoice-status", salesInvoiceId] });
      } else {
        toast.error("E-fatura gönderimi başarısız");
      }
    },
    onError: (error) => {
      console.error("E-fatura gönderim hatası:", error);
      toast.error("E-fatura gönderilirken bir hata oluştu");
    },
  });

  // Manuel durum kontrolü
  const checkStatusMutation = useMutation({
    mutationFn: (salesInvoiceId: string) => eInvoiceService.checkStatusManually(salesInvoiceId),
    onSuccess: (success, salesInvoiceId) => {
      if (success) {
        toast.success("Durum kontrolü tamamlandı");
        queryClient.invalidateQueries({ queryKey: ["einvoice-status", salesInvoiceId] });
      } else {
        toast.error("Durum kontrolü başarısız");
      }
    },
    onError: (error) => {
      console.error("Durum kontrolü hatası:", error);
      toast.error("Durum kontrolü sırasında hata oluştu");
    },
  });



  return {
    // Actions
    sendInvoice: sendInvoiceMutation.mutate,
    checkStatus: checkStatusMutation.mutate,

    // States
    isSending: sendInvoiceMutation.isPending,
    isCheckingStatus: checkStatusMutation.isPending,
  };
};

// Spesifik fatura durum takibi hook'u
export const useEInvoiceStatus = (salesInvoiceId?: string) => {
  const [status, setStatus] = useState<EInvoiceStatusTracking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!salesInvoiceId) return;

    const fetchStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const statusData = await eInvoiceService.getInvoiceStatus(salesInvoiceId);
        setStatus(statusData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();

    // Her 30 saniyede bir durum güncelle
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [salesInvoiceId]);

  const refreshStatus = async () => {
    if (!salesInvoiceId) return;
    
    setIsLoading(true);
    try {
      const statusData = await eInvoiceService.getInvoiceStatus(salesInvoiceId);
      setStatus(statusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    status,
    isLoading,
    error,
    refreshStatus
  };
};

// E-fatura durum helper'ları
export const getStatusDisplay = (status?: string) => {
  switch (status) {
    case 'draft':
      return { text: 'Taslak', color: 'gray' };
    case 'sending':
      return { text: 'Gönderiliyor', color: 'blue' };
    case 'sent':
      return { text: 'Gönderildi', color: 'yellow' };
    case 'delivered':
      return { text: 'Teslim Edildi', color: 'orange' };
    case 'accepted':
      return { text: 'Kabul Edildi', color: 'green' };
    case 'rejected':
      return { text: 'Reddedildi', color: 'red' };
    case 'cancelled':
      return { text: 'İptal Edildi', color: 'gray' };
    case 'error':
      return { text: 'Hata', color: 'red' };
    default:
      return { text: 'Bilinmiyor', color: 'gray' };
  }
};


