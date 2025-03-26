
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ExchangeRate, FetchError } from "./exchange-rates/types";
import { fallbackRates } from "./exchange-rates/fallbackRates";
import { fetchExchangeRatesFromDB, fetchTCMBRates } from "./exchange-rates/exchangeRatesFetcher";
import { 
  getRatesMap, 
  convertCurrency, 
  formatCurrency 
} from "./exchange-rates/currencyUtils";

export const useExchangeRates = (pollingInterval = 3600000) => { // 1 hour by default
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const loadExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get rates from the database
      try {
        console.log('Trying to fetch rates from database...');
        const rates = await fetchExchangeRatesFromDB();
        
        if (rates && rates.length > 0) {
          setExchangeRates(rates);
          setLastUpdate(rates[0].update_date);
          console.log(`Exchange rates loaded from database:`, rates.length);
          return;
        }
      } catch (dbError) {
        console.warn(`Database fetch method failed:`, dbError);
      }
      
      // If we get here, use fallback rates
      console.warn("Using fallback rates");
      setExchangeRates(fallbackRates);
      setLastUpdate(fallbackRates[0].update_date);
      
    } catch (err) {
      console.error("Error loading exchange rates:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      setExchangeRates(fallbackRates);
      setLastUpdate(fallbackRates[0].update_date);
      console.warn("Using fallback exchange rates (error)");
    } finally {
      setLoading(false);
    }
  };

  const refreshExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      toast.info('Döviz kurları güncelleniyor...', {
        duration: 2000
      });
      
      // Directly fetch from TCMB via our function
      const rates = await fetchTCMBRates();
      
      if (rates.length > 0) {
        setExchangeRates(rates);
        setLastUpdate(rates[0].update_date);
        
        toast.success('Döviz kurları başarıyla güncellendi', {
          description: `${rates.length} adet kur bilgisi alındı.`,
        });
        
        return;
      }
      
      throw new Error("Döviz kurları güncellenemedi. Lütfen daha sonra tekrar deneyin.");
      
    } catch (err) {
      console.error("Error refreshing exchange rates:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast.error('Döviz kurları güncelleme hatası', {
        description: err instanceof Error ? err.message : 'Bilinmeyen hata',
      });
      
      // Only fallback if we have no rates already
      if (exchangeRates.length === 0) {
        setExchangeRates(fallbackRates);
        setLastUpdate(fallbackRates[0].update_date);
        
        toast.warning('Varsayılan kurlar kullanılıyor', {
          description: 'Güncel kurlar alınamadı, geçici referans değerler kullanılıyor.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExchangeRates();
    
    const pollingTimer = setInterval(() => {
      console.log("Polling for exchange rate updates...");
      loadExchangeRates();
    }, pollingInterval);
    
    // Setup Supabase Realtime subscription
    const channel = supabase
      .channel('public:exchange_rates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'exchange_rates' },
        payload => {
          console.log('New exchange rate inserted:', payload);
          loadExchangeRates();
        })
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'exchange_rates' },
        payload => {
          console.log('Exchange rate updated:', payload);
          loadExchangeRates();
        })
      .subscribe(status => {
        console.log('Realtime subscription status:', status);
      });
    
    return () => {
      clearInterval(pollingTimer);
      supabase.removeChannel(channel);
    };
  }, [pollingInterval]);

  return {
    exchangeRates,
    loading,
    error,
    lastUpdate,
    refreshExchangeRates,
    getRatesMap: () => getRatesMap(exchangeRates),
    convertCurrency,
    formatCurrency
  };
};

export type { ExchangeRate };
