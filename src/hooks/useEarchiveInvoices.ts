import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EarchiveInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerTaxNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  taxAmount: number;
  status: string;
  statusCode: string;
  sendType: string;
  isCancel: boolean;
  isReport: boolean;
  isRead: boolean;
  isPrint: boolean;
  isInternet: boolean;
  isTransfer: boolean;
  pdfUrl?: string;
  xmlData: any;
}

export const useEarchiveInvoices = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchEarchiveInvoices = async (): Promise<EarchiveInvoice[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetch_earchive' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'E-Arşiv faturalar alınamadı');
      }

      if (!data.success) {
        throw new Error(data.error || 'E-Arşiv faturalar alınamadı');
      }

      console.log('Fetched e-archive invoices:', data.invoices?.length || 0);
      return data.invoices || [];
      
    } catch (error: any) {
      console.error('Error fetching e-archive invoices:', error);
      toast.error(error.message || 'E-Arşiv faturalar yüklenirken hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const { data: earchiveInvoices = [], error, refetch } = useQuery({
    queryKey: ['earchive-invoices'],
    queryFn: fetchEarchiveInvoices,
    retry: 1,
    retryDelay: 1000,
  });

  return {
    earchiveInvoices,
    isLoading,
    error,
    refetch,
  };
};