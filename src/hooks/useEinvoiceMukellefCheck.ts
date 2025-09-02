import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EinvoiceMukellefData {
  aliasName?: string;
  companyName?: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  city?: string;
  district?: string;
  mersisNo?: string;
  sicilNo?: string;
}

interface EinvoiceMukellefCheckResult {
  isEinvoiceMukellef: boolean;
  data?: EinvoiceMukellefData;
  message?: string;
}

export const useEinvoiceMukellefCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<EinvoiceMukellefCheckResult | null>(null);

  const checkEinvoiceMukellef = useCallback(async (taxNumber: string): Promise<EinvoiceMukellefCheckResult> => {
    if (!taxNumber || taxNumber.length < 10) {
      setResult(null);
      return { isEinvoiceMukellef: false };
    }

    setIsChecking(true);
    setResult(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      // Call Nilvera edge function
      const { data, error } = await supabase.functions.invoke('nilvera-invoices', {
        body: {
          action: 'check_einvoice_mukellef',
          taxNumber: taxNumber
        }
      });

      if (error) {
        console.error('E-fatura mükellefi kontrolü hatası:', error);
        throw new Error(error.message || 'E-fatura mükellefi kontrolü yapılamadı');
      }

      if (!data.success) {
        throw new Error(data.error || 'E-fatura mükellefi kontrolü başarısız');
      }

      const checkResult: EinvoiceMukellefCheckResult = {
        isEinvoiceMukellef: data.isEinvoiceMukellef,
        data: data.data,
        message: data.message
      };

      setResult(checkResult);
      return checkResult;

    } catch (error) {
      console.error('E-fatura mükellefi kontrolü hatası:', error);
      const errorResult: EinvoiceMukellefCheckResult = {
        isEinvoiceMukellef: false,
        message: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    checkEinvoiceMukellef,
    isChecking,
    result,
    clearResult
  };
};
