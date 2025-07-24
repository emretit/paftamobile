import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IncomingInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  supplierTaxNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  taxAmount: number;
  status: string;
  responseStatus?: string;
  isAnswered: boolean;
  pdfUrl?: string;
  xmlData: any;
}

export const useIncomingInvoices = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncomingInvoices = async (): Promise<IncomingInvoice[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: { action: 'fetch_incoming' }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Gelen faturalar alınamadı');
      }

      if (!data.success) {
        throw new Error(data.error || 'Gelen faturalar alınamadı');
      }

      console.log('Fetched incoming invoices:', data.invoices?.length || 0);
      return data.invoices || [];
      
    } catch (error: any) {
      console.error('Error fetching incoming invoices:', error);
      toast.error(error.message || 'Gelen faturalar yüklenirken hata oluştu');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const { data: incomingInvoices = [], error, refetch } = useQuery({
    queryKey: ['incoming-invoices'],
    queryFn: fetchIncomingInvoices,
    retry: 1,
    retryDelay: 1000,
  });

  return {
    incomingInvoices,
    isLoading,
    error,
    refetch,
  };
};