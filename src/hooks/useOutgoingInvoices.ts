import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OutgoingInvoice {
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
  answerCode?: string;
  isRead: boolean;
  isPrint: boolean;
  isArchive: boolean;
  pdfUrl?: string;
  xmlData: any;
}

export const useOutgoingInvoices = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchOutgoingInvoices = async (): Promise<OutgoingInvoice[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetch_outgoing' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Giden faturalar alınamadı');
      }

      if (!data.success) {
        throw new Error(data.error || 'Giden faturalar alınamadı');
      }

      console.log('Fetched outgoing invoices:', data.invoices?.length || 0);
      return data.invoices || [];
      
    } catch (error: any) {
      console.error('Error fetching outgoing invoices:', error);
      toast.error(error.message || 'Giden faturalar yüklenirken hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const { data: outgoingInvoices = [], error, refetch } = useQuery({
    queryKey: ['outgoing-invoices'],
    queryFn: fetchOutgoingInvoices,
    retry: 1,
    retryDelay: 1000,
  });

  return {
    outgoingInvoices,
    isLoading,
    error,
    refetch,
  };
};