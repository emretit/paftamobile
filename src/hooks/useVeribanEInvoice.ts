import { useState, useCallback } from 'react';
import { VeribanEInvoiceService } from '../services/veriban/veribanService';
import { 
  TransferResult, 
  TransferQueryResult, 
  InvoiceQueryResult,
  PurchaseInvoiceInfo,
  OperationResult,
  DownloadResult,
  VeribanConfig
} from '../services/veriban/types';

export const useVeribanEInvoice = (config?: Partial<VeribanConfig>) => {
  const [service] = useState(() => new VeribanEInvoiceService(config));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any) => {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    setError(errorMessage);
    console.error('Veriban E-Fatura Hatası:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.login();
      return result;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const sendInvoice = useCallback(async (
    xmlContent: string,
    fileName: string,
    customerAlias?: string,
    isDirectSend: boolean = true
  ): Promise<TransferResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.sendInvoice(xmlContent, fileName, customerAlias, isDirectSend);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const getTransferStatus = useCallback(async (transferFileUniqueId: string): Promise<TransferQueryResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getTransferStatus(transferFileUniqueId);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const getInvoiceStatus = useCallback(async (invoiceUUID: string): Promise<InvoiceQueryResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getInvoiceStatus(invoiceUUID);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const getIncomingInvoices = useCallback(async (): Promise<PurchaseInvoiceInfo[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getIncomingInvoices();
      return result;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const answerInvoice = useCallback(async (
    invoiceUUID: string,
    answerType: 'ACCEPTED' | 'REJECTED',
    note: string = ''
  ): Promise<OperationResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.answerInvoice(invoiceUUID, answerType, note);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const downloadInvoice = useCallback(async (
    invoiceUUID: string,
    downloadType: 'XML_INZIP' | 'HTML_INZIP' | 'PDF_INZIP' = 'XML_INZIP'
  ): Promise<DownloadResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.downloadInvoice(invoiceUUID, downloadType);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await service.logout();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  return {
    // State
    loading,
    error,
    
    // Actions
    login,
    sendInvoice,
    getTransferStatus,
    getInvoiceStatus,
    getIncomingInvoices,
    answerInvoice,
    downloadInvoice,
    logout,
    clearError
  };
}; 