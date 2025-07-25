import { useState, useCallback } from 'react';
import { VeribanEInvoiceService } from '../services/veriban/veribanService';
import { 
  TransferResult, 
  DocumentSendResult,
  TransferQueryResult, 
  InvoiceQueryResult,
  PurchaseInvoiceInfo,
  OperationResult,
  DownloadResult,
  CustomerAlias,
  DownloadDocumentDataTypes,
  VeribanConfig
} from '../services/veriban/types';

export const useVeribanEInvoice = () => {
  const [service] = useState(() => new VeribanEInvoiceService());
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

  const testLogin = useCallback(async (): Promise<{ success: boolean; message: string; sessionCode?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.testLogin();
      if (!result.success) {
        setError(result.message);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
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

  const sendDocumentFile = useCallback(async (
    xmlContent: string,
    fileName: string,
    customerAlias?: string,
    isDirectSend: boolean = true,
    useSerieCode: boolean = false,
    serieCode?: string
  ): Promise<DocumentSendResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.sendDocumentFile(
        xmlContent, 
        fileName, 
        customerAlias, 
        isDirectSend, 
        useSerieCode, 
        serieCode
      );
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
    downloadType: DownloadDocumentDataTypes = DownloadDocumentDataTypes.XML_INZIP
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

  const getCustomerAliasInfo = useCallback(async (registerNumber: string): Promise<CustomerAlias[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getCustomerAliasInfo(registerNumber);
      return result;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.logout();
      return result;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const getUnTransferredPurchaseInvoices = useCallback(async (): Promise<PurchaseInvoiceInfo[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getUnTransferredPurchaseInvoiceList();
      return result;
    } catch (error) {
      // Eğer oturum açılmamışsa, otomatik login dene
      if (error instanceof Error && error.message.includes('oturum açmalısınız')) {
        try {
          const loginSuccess = await service.login();
          if (loginSuccess) {
            // Login başarılıysa tekrar dene
            const result = await service.getUnTransferredPurchaseInvoiceList();
            return result;
          } else {
            handleError(new Error('Oturum açma başarısız. Lütfen ayarlarınızı kontrol edin.'));
          }
        } catch (loginError) {
          handleError(loginError);
        }
      } else {
        handleError(error);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const getPurchaseInvoiceUUIDs = useCallback(async (startDate: Date, endDate: Date): Promise<string[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getPurchaseInvoiceUUIDList(startDate, endDate);
      return result;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const getAllPurchaseInvoiceUUIDs = useCallback(async (startDate: Date, endDate: Date): Promise<string[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getAllPurchaseInvoiceUUIDList(startDate, endDate);
      return result;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const getPurchaseInvoiceDetailsFromUUIDs = useCallback(async (uuids: string[]): Promise<PurchaseInvoiceInfo[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getPurchaseInvoiceDetailsFromUUIDs(uuids);
      return result;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const getUnTransferredPurchaseInvoiceUUIDs = useCallback(async (): Promise<string[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.getUnTransferredPurchaseInvoiceUUIDList();
      return result;
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const downloadPurchaseInvoice = useCallback(async (
    invoiceUUID: string, 
    downloadType: DownloadDocumentDataTypes = DownloadDocumentDataTypes.XML_INZIP
  ): Promise<DownloadResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.downloadPurchaseInvoice(invoiceUUID, downloadType);
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const markPurchaseInvoiceAsTransferred = useCallback(async (invoiceUUID: string): Promise<OperationResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await service.markPurchaseInvoiceAsTransferred(invoiceUUID);
      return result;
    } catch (error) {
      handleError(error);
      return null;
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
    testLogin,
    sendInvoice,
    sendDocumentFile,
    getTransferStatus,
    getInvoiceStatus,
    getIncomingInvoices,
    answerInvoice,
    downloadInvoice,
    getCustomerAliasInfo,
    logout,
    clearError,
    getUnTransferredPurchaseInvoices,
    getPurchaseInvoiceUUIDs,
    getAllPurchaseInvoiceUUIDs,
    getPurchaseInvoiceDetailsFromUUIDs,
    getUnTransferredPurchaseInvoiceUUIDs,
    downloadPurchaseInvoice,
    markPurchaseInvoiceAsTransferred
  };
}; 