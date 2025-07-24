import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NilveraOutgoingInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerTaxNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  taxAmount: number;
  status: string;
  statusDetail: string;
  answerCode: string;
  pdfUrl: string | null;
  xmlData: any;
  isRead: boolean;
  isPrint: boolean;
  isArchive: boolean;
  isTransfer: boolean;
  createdDate: string;
  envelopeUUID: string;
  envelopeDate: string;
  email: string;
  tags: Array<{
    UUID: string;
    Description: string;
    Name: string;
    Color: string;
  }>;
  specialCode: string;
  lucaStatus: {
    Status: string;
    Description: string;
  };
  invoiceProfile: string;
  invoiceType: string;
  exchangeRate: number;
  taxExclusiveAmount: number;
  lineExtensionAmount: number;
  allowanceTotalAmount: number;
  chargeTotalAmount: number;
}

export interface NilveraFilters {
  search: string;
  startDate?: Date;
  endDate?: Date;
  pageSize: number;
  page: number;
  statusCode?: string;
  answerCode?: string;
  invoiceProfile?: string;
  invoiceType?: string;
  isRead?: boolean;
  isPrint?: boolean;
  isArchive?: boolean;
  isTransfer?: boolean;
}

export interface NilveraPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const useNilveraOutgoingInvoices = () => {
  const [invoices, setInvoices] = useState<NilveraOutgoingInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<NilveraPagination>({
    page: 1,
    pageSize: 100,
    totalCount: 0,
    totalPages: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (filters: Partial<NilveraFilters> = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-outgoing-invoices', {
        body: { 
          action: 'fetch_outgoing',
          params: {
            pageSize: filters.pageSize || 100,
            page: filters.page || 1,
            search: filters.search || undefined,
            startDate: filters.startDate?.toISOString(),
            endDate: filters.endDate?.toISOString(),
            statusCode: filters.statusCode,
            answerCode: filters.answerCode,
            invoiceProfile: filters.invoiceProfile,
            invoiceType: filters.invoiceType,
            isRead: filters.isRead,
            isPrint: filters.isPrint,
            isArchive: filters.isArchive,
            isTransfer: filters.isTransfer,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.success) {
        setInvoices(data.data.invoices || []);
        setPagination(data.data.pagination || {
          page: 1,
          pageSize: 100,
          totalCount: 0,
          totalPages: 0,
        });
        
        toast.success(`${data.data.invoices?.length || 0} fatura yüklendi`);
      } else {
        throw new Error(data?.error || 'Giden faturalar yüklenemedi');
      }
    } catch (error: any) {
      console.error('Giden faturalar yükleme hatası:', error);
      setError(error.message);
      toast.error('Faturalar yüklenirken hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadPDF = useCallback(async (uuid: string, invoiceNumber: string) => {
    try {
      const response = await supabase.functions.invoke('nilvera-outgoing-invoices', {
        body: { 
          action: 'get_invoice_pdf',
          params: { uuid }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatura-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF indirildi');
    } catch (error: any) {
      console.error('PDF indirme hatası:', error);
      toast.error('PDF indirilemedi: ' + error.message);
    }
  }, []);

  const downloadXML = useCallback(async (uuid: string, invoiceNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-outgoing-invoices', {
        body: { 
          action: 'get_invoice_xml',
          params: { uuid }
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.success) {
        // Create and trigger XML download
        const blob = new Blob([data.data.xmlData], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fatura-${invoiceNumber}.xml`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('XML indirildi');
      } else {
        throw new Error(data?.error || 'XML indirilemedi');
      }
    } catch (error: any) {
      console.error('XML indirme hatası:', error);
      toast.error('XML indirilemedi: ' + error.message);
    }
  }, []);

  const getInvoiceDetails = useCallback(async (uuid: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('nilvera-outgoing-invoices', {
        body: { 
          action: 'get_invoice_details',
          params: { uuid }
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.success) {
        return data.data;
      } else {
        throw new Error(data?.error || 'Fatura detayları alınamadı');
      }
    } catch (error: any) {
      console.error('Fatura detayları alma hatası:', error);
      toast.error('Fatura detayları alınamadı: ' + error.message);
      throw error;
    }
  }, []);

  const sendByEmail = useCallback(async (uuid: string, email: string) => {
    try {
      // This would be implemented based on Nilvera's email sending API
      toast.info('E-posta gönderme özelliği yakında eklenecek');
    } catch (error: any) {
      console.error('E-posta gönderme hatası:', error);
      toast.error('E-posta gönderilemedi: ' + error.message);
    }
  }, []);

  const sendByWhatsApp = useCallback(async (uuid: string, phoneNumber: string) => {
    try {
      // This would be implemented based on Nilvera's WhatsApp sending API
      toast.info('WhatsApp gönderme özelliği yakında eklenecek');
    } catch (error: any) {
      console.error('WhatsApp gönderme hatası:', error);
      toast.error('WhatsApp gönderilemedi: ' + error.message);
    }
  }, []);

  const sendBySMS = useCallback(async (uuid: string, phoneNumber: string) => {
    try {
      // This would be implemented based on Nilvera's SMS sending API
      toast.info('SMS gönderme özelliği yakında eklenecek');
    } catch (error: any) {
      console.error('SMS gönderme hatası:', error);
      toast.error('SMS gönderilemedi: ' + error.message);
    }
  }, []);

  return {
    invoices,
    isLoading,
    error,
    pagination,
    fetchInvoices,
    downloadPDF,
    downloadXML,
    getInvoiceDetails,
    sendByEmail,
    sendByWhatsApp,
    sendBySMS,
  };
};