
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ExchangeRate, FetchError } from "./exchange-rates/types";
import { fallbackRates } from "./exchange-rates/fallbackRates";
import { 
  fetchExchangeRatesFromDB, 
  invokeEdgeFunction, 
  enableRealtime 
} from "./exchange-rates/exchangeRatesFetcher";
import { 
  getRatesMap, 
  convertCurrency, 
  formatCurrency 
} from "./exchange-rates/currencyUtils";

export const useExchangeRates = (pollingInterval = 300000) => { // 5 minutes by default
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FetchError | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const loadExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try each method in sequence, using the first successful one
      const methods = [
        { name: 'Database', fn: fetchExchangeRatesFromDB },
        { name: 'Edge Function', fn: invokeEdgeFunction }
      ];
      
      for (const method of methods) {
        try {
          console.log(`Trying to fetch rates using ${method.name}...`);
          const rates = await method.fn();
          
          if (rates && rates.length > 0) {
            setExchangeRates(rates);
            setLastUpdate(rates[0].update_date);
            console.log(`Exchange rates loaded via ${method.name}:`, rates.length);
            
            // If we succeeded with anything other than the edge function,
            // trigger the edge function in the background to refresh rates
            if (method.name !== 'Edge Function') {
              invokeEdgeFunction().catch(e => 
                console.warn("Background refresh of exchange rates failed:", e));
            }
            
            return;
          }
        } catch (methodError) {
          console.warn(`${method.name} method failed:`, methodError);
          // Continue to the next method
        }
      }
      
      // If we get here, all methods failed
      console.warn("All methods failed, using fallback rates");
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
      
      const rates = await invokeEdgeFunction();
      
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
    enableRealtime();
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
