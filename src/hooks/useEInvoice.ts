import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface EInvoiceStatusTracking {
  id: string;
  sales_invoice_id: string;
  nilvera_invoice_id?: string;
  nilvera_transfer_id?: string;
  status: 'draft' | 'sending' | 'sent' | 'delivered' | 'accepted' | 'rejected' | 'cancelled' | 'error';
  transfer_state: number;
  invoice_state: number;
  answer_type: number;
  sent_at?: string;
  delivered_at?: string;
  responded_at?: string;
  error_message?: string;
  error_code?: string;
  nilvera_response?: any;
}

export const useEInvoice = () => {
  const queryClient = useQueryClient();

  // Direkt fatura gönderme
  const sendInvoiceMutation = useMutation({
    mutationFn: async (salesInvoiceId: string) => {
      const { data, error } = await supabase.functions.invoke('nilvera-send-invoice', {
        body: { 
          salesInvoiceId 
        }
      });
      
      if (error) {
        // Handle specific error cases
        if (error.message?.includes('409')) {
          throw new Error('Bu fatura zaten gönderiliyor veya gönderilmiş. Lütfen birkaç dakika bekleyin.');
        } else if (error.message?.includes('401')) {
          throw new Error('Nilvera kimlik doğrulama hatası. Lütfen ayarlarınızı kontrol edin.');
        } else if (error.message?.includes('404')) {
          throw new Error('Fatura bulunamadı.');
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, salesInvoiceId) => {
      if (data?.success) {
        toast.success("E-fatura başarıyla gönderildi");
        queryClient.invalidateQueries({ queryKey: ["einvoice-status", salesInvoiceId] });
      } else if (data?.status === 'sending') {
        toast.info("Fatura şu anda gönderiliyor. Lütfen birkaç dakika bekleyin.");
      } else {
        toast.error(data?.error || "E-fatura gönderimi başarısız");
      }
    },
    onError: (error) => {
      console.error("E-fatura gönderim hatası:", error);
      toast.error(error.message || "E-fatura gönderilirken bir hata oluştu");
    },
  });

  // Manuel durum kontrolü
  const checkStatusMutation = useMutation({
    mutationFn: async (salesInvoiceId: string) => {
      const { data, error } = await supabase.functions.invoke('nilvera-check-status', {
        body: { 
          salesInvoiceId 
        }
      });
      
      if (error) throw error;
      return data?.success || false;
    },
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
        const { data, error } = await supabase
          .from('einvoice_status_tracking')
          .select('*')
          .eq('sales_invoice_id', salesInvoiceId)
          .maybeSingle();
          
        if (error) throw error;
        setStatus(data);
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
      const { data, error } = await supabase
        .from('einvoice_status_tracking')
        .select('*')
        .eq('sales_invoice_id', salesInvoiceId)
        .maybeSingle();
        
      if (error) throw error;
      setStatus(data);
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


