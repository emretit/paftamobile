
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ExchangeRate, UpdateStatus } from "../types/exchangeRateTypes";
import { getFallbackRates } from "../utils/exchangeRateUtils";

export const useExchangeRateData = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdateStatus, setLastUpdateStatus] = useState<UpdateStatus | null>(null);

  const fetchLastUpdateStatus = async () => {
    try {
      // First check if the table exists in the database
      try {
        // Type assertion to handle the table not being in the TypeScript types
        const { data: tableExists, error: tableError } = await (supabase
          .from('exchange_rate_updates' as any)
          .select('count(*)', { count: 'exact', head: true }) as any);
          
        // If there's an error with the table, likely it doesn't exist yet
        if (tableError) {
          console.log('Exchange rate updates table may not exist yet:', tableError.message);
          return;
        }
        
        const { data, error } = await (supabase
          .from('exchange_rate_updates' as any)
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1) as any);
        
        if (error) {
          console.error('Error fetching update status:', error);
          return;
        }
        
        if (data && data.length > 0) {
          setLastUpdateStatus({
            status: data[0].status,
            message: data[0].message
          });
        }
      } catch (err) {
        console.error('Error accessing exchange_rate_updates table:', err);
      }
    } catch (err) {
      console.error('Error in fetchLastUpdateStatus:', err);
    }
  };
  
  const fetchExchangeRates = async () => {
    try {
      setIsRefreshing(true);
      
      // Use the Supabase client to fetch exchange rates
      const { data, error: queryError } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('update_date', { ascending: false });
      
      if (queryError) {
        throw new Error(`Veritabanından döviz kurları alınamadı: ${queryError.message}`);
      }
      
      if (!data || data.length === 0) {
        // If no data in the database, try calling the function to get fresh data
        const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-exchange-rates', {
          method: 'GET'
        });
        
        if (functionError) {
          throw new Error(`Döviz kurları çekilemedi: ${functionError.message}`);
        }
        
        if (functionData && functionData.data && functionData.data.length > 0) {
          const formattedRates: ExchangeRate[] = functionData.data.map((rate: any) => ({
            currency_code: rate.currency_code,
            forex_buying: rate.forex_buying,
            forex_selling: rate.forex_selling,
            banknote_buying: rate.banknote_buying,
            banknote_selling: rate.banknote_selling,
            cross_rate: rate.cross_rate,
            update_date: functionData.update_date || new Date().toISOString()
          }));
          
          setRates(formattedRates);
          setLastUpdated(functionData.update_date || new Date().toISOString());
        } else {
          throw new Error('Döviz kuru verisi bulunamadı');
        }
      } else {
        setRates(data as ExchangeRate[]);
        const updateDate = data.length > 0 ? data[0].update_date : null;
        setLastUpdated(updateDate);
      }
      
      setError(null);
      
      if (isRefreshing) {
        toast.success('Döviz kurları başarıyla güncellendi');
      }
      
      fetchLastUpdateStatus();
    } catch (err: any) {
      console.error('Failed to fetch exchange rates:', err);
      setError(err.message);
      toast.error('Döviz kurları güncellenirken bir hata oluştu');
      
      const fallbackRates = getFallbackRates();
      setRates(fallbackRates);
      setLastUpdated(new Date().toISOString());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-exchange-rate-update', {
        method: 'POST'
      });
      
      if (error) {
        throw new Error(`Döviz kurları güncellenirken hata oluştu: ${error.message}`);
      }
      
      if (data && data.success) {
        toast.success('Döviz kurları başarıyla güncellendi');
        fetchExchangeRates();
      } else {
        throw new Error(data?.message || 'Döviz kurları güncellenirken hata oluştu');
      }
    } catch (err: any) {
      console.error('Failed to refresh exchange rates:', err);
      toast.error('Döviz kurları güncellenirken bir hata oluştu');
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
    
    const intervalId = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    rates,
    isLoading,
    error,
    lastUpdated,
    isRefreshing,
    lastUpdateStatus,
    handleRefresh
  };
};

export default useExchangeRateData;
