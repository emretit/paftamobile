import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { InvoiceData, DocumentSendResult, TransferResult, PurchaseInvoiceInfo } from '../services/veriban/types';

interface DatabaseInvoice {
  id: string;
  invoice_uuid: string;
  invoice_number: string;
  customer_vkn?: string;
  customer_name?: string;
  total_amount?: number;
  tax_amount?: number;
  payable_amount?: number;
  currency_code: string;
  xml_content?: string;
  file_name?: string;
  transfer_state_code: number;
  invoice_state_code: number;
  created_at: string;
  updated_at: string;
}

interface DatabaseSettings {
  id: string;
  test_user_name: string;
  test_password: string;
  live_user_name?: string;
  live_password?: string;
  test_service_url: string;
  live_service_url: string;
  is_test_mode: boolean;
}

export const useEInvoiceDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any) => {
    const errorMessage = error instanceof Error ? error.message : 'Veritabanı hatası';
    setError(errorMessage);
    console.error('E-Fatura DB Hatası:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Veriban ayarlarını getir
  const getVeribanSettings = useCallback(async (): Promise<DatabaseSettings | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { data, error } = await supabase
        .from('veriban_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Veriban ayarlarını kaydet
  const saveVeribanSettings = useCallback(async (settings: Partial<DatabaseSettings>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { error } = await supabase
        .from('veriban_settings')
        .upsert({
          user_id: user.id,
          ...settings
        });

      if (error) throw error;

      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Gönderilen faturayı kaydet
  const saveSentInvoice = useCallback(async (
    invoiceData: InvoiceData,
    result: DocumentSendResult | TransferResult,
    xmlContent: string,
    fileName: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const invoiceRecord = {
        user_id: user.id,
        invoice_uuid: 'documentUUID' in result ? result.documentUUID : '',
        invoice_number: invoiceData.invoiceNumber,
        transfer_file_unique_id: 'transferFileUniqueId' in result ? result.transferFileUniqueId : undefined,
        customer_vkn: invoiceData.customerVkn,
        customer_name: invoiceData.customerName,
        invoice_profile: invoiceData.invoiceProfile,
        invoice_type: invoiceData.invoiceType,
        total_amount: invoiceData.totalAmount,
        tax_amount: invoiceData.taxAmount,
        payable_amount: invoiceData.payableAmount,
        currency_code: invoiceData.currencyCode,
        xml_content: xmlContent,
        file_name: fileName,
        transfer_state_code: 2, // ISLENMEYI BEKLIYOR
        transfer_state_name: 'İşlenmeyi Bekliyor',
        invoice_state_code: 1, // TASLAK
        invoice_state_name: 'Taslak Veri'
      };

      const { data, error } = await supabase
        .from('einvoices_sent')
        .insert(invoiceRecord)
        .select('id')
        .single();

      if (error) throw error;

      // Fatura kalemlerini kaydet
      if (data && invoiceData.items.length > 0) {
        const items = invoiceData.items.map((item, index) => ({
          invoice_id: data.id,
          invoice_type: 'sent',
          line_number: index + 1,
          item_name: item.name,
          quantity: item.quantity,
          unit_code: item.unit,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          tax_rate: item.taxRate,
          tax_amount: item.taxAmount
        }));

        const { error: itemsError } = await supabase
          .from('einvoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return data.id;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Gönderilen faturaları listele
  const getSentInvoices = useCallback(async (limit: number = 50): Promise<DatabaseInvoice[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { data, error } = await supabase
        .from('einvoices_sent')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fatura durumunu güncelle
  const updateInvoiceStatus = useCallback(async (
    invoiceId: string,
    statusData: {
      transfer_state_code?: number;
      transfer_state_name?: string;
      transfer_state_description?: string;
      invoice_state_code?: number;
      invoice_state_name?: string;
      invoice_state_description?: string;
      answer_state_code?: number;
      answer_state_name?: string;
      answer_type_code?: number;
      answer_type_name?: string;
      envelope_identifier?: string;
      envelope_gib_code?: number;
      envelope_gib_state_name?: string;
    }
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('einvoices_sent')
        .update(statusData)
        .eq('id', invoiceId);

      if (error) throw error;

      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Gelen faturayı kaydet
  const saveReceivedInvoice = useCallback(async (invoice: PurchaseInvoiceInfo): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const invoiceRecord = {
        user_id: user.id,
        invoice_uuid: invoice.invoiceUUID,
        invoice_number: invoice.invoiceNumber,
        sender_vkn: invoice.customerRegisterNumber,
        sender_name: invoice.customerTitle,
        invoice_profile: invoice.invoiceProfile,
        invoice_type: invoice.invoiceType,
        issue_time: invoice.issueTime,
        line_extension_amount: invoice.lineExtensionAmount,
        allowance_total_amount: invoice.allowanceTotalAmount,
        tax_exclusive_amount: invoice.taxExclusiveAmount,
        tax_total_amount: invoice.taxTotalAmount,
        payable_amount: invoice.payableAmount,
        currency_code: invoice.currencyCode,
        exchange_rate: invoice.exchangeRate,
        is_read: invoice.isRead
      };

      const { data, error } = await supabase
        .from('einvoices_received')
        .upsert(invoiceRecord, { onConflict: 'invoice_uuid' })
        .select('id')
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Gelen faturaları listele
  const getReceivedInvoices = useCallback(async (limit: number = 50): Promise<any[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { data, error } = await supabase
        .from('einvoices_received')
        .select('*')
        .eq('user_id', user.id)
        .order('received_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fatura cevabını güncelle
  const updateInvoiceAnswer = useCallback(async (
    invoiceUuid: string,
    answerType: 'ACCEPTED' | 'REJECTED',
    note: string = ''
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const { error } = await supabase
        .from('einvoices_received')
        .update({
          answer_type: answerType,
          answer_note: note,
          answer_sent_at: new Date().toISOString()
        })
        .eq('invoice_uuid', invoiceUuid)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Müşteri etiketlerini kaydet
  const saveCustomerAliases = useCallback(async (aliases: any[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

      const aliasRecords = aliases.map(alias => ({
        user_id: user.id,
        identifier_number: alias.identifierNumber,
        alias: alias.alias,
        title: alias.title,
        type: alias.type,
        register_time: alias.registerTime,
        alias_creation_time: alias.aliasCreationTime,
        document_type: alias.documentType,
        is_einvoice_taxpayer: alias.documentType === 'Invoice'
      }));

      const { error } = await supabase
        .from('customer_aliases')
        .upsert(aliasRecords, { onConflict: 'user_id,identifier_number,alias' });

      if (error) throw error;

      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // İşlem logunu kaydet
  const logOperation = useCallback(async (
    operationType: string,
    operationDetails: any,
    success: boolean = true,
    errorMessage?: string,
    responseData?: any
  ): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('einvoice_logs')
        .insert({
          user_id: user.id,
          operation_type: operationType,
          operation_details: operationDetails,
          success,
          error_message: errorMessage,
          response_data: responseData
        });
    } catch (error) {
      console.error('Log kaydetme hatası:', error);
    }
  }, []);

  return {
    // State
    loading,
    error,
    
    // Settings
    getVeribanSettings,
    saveVeribanSettings,
    
    // Sent Invoices
    saveSentInvoice,
    getSentInvoices,
    updateInvoiceStatus,
    
    // Received Invoices
    saveReceivedInvoice,
    getReceivedInvoices,
    updateInvoiceAnswer,
    
    // Customer Aliases
    saveCustomerAliases,
    
    // Logging
    logOperation,
    
    // Utils
    clearError
  };
}; 