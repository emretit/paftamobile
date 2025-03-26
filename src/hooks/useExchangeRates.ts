
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExchangeRate {
  id: string;
  currency_code: string;
  forex_buying: number | null;
  forex_selling: number | null;
  banknote_buying: number | null;
  banknote_selling: number | null;
  cross_rate: number | null;
  update_date: string;
}

// Fallback exchange rates when API fails
const fallbackRates: ExchangeRate[] = [
  {
    id: "fallback-try",
    currency_code: "TRY",
    forex_buying: 1,
    forex_selling: 1,
    banknote_buying: 1,
    banknote_selling: 1,
    cross_rate: null,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-usd",
    currency_code: "USD",
    forex_buying: 32.5,
    forex_selling: 32.7,
    banknote_buying: 32.4,
    banknote_selling: 32.8,
    cross_rate: 1,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-eur",
    currency_code: "EUR",
    forex_buying: 35.2,
    forex_selling: 35.4,
    banknote_buying: 35.1,
    banknote_selling: 35.5,
    cross_rate: 1.08,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-gbp",
    currency_code: "GBP",
    forex_buying: 41.3,
    forex_selling: 41.5,
    banknote_buying: 41.2,
    banknote_selling: 41.6,
    cross_rate: 1.27,
    update_date: new Date().toISOString().split('T')[0]
  }
];

export const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Fetch exchange rates from database
  const fetchExchangeRatesFromDB = async (): Promise<ExchangeRate[]> => {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .order('update_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  };

  // Trigger edge function to fetch fresh rates
  const fetchFreshRates = async (): Promise<ExchangeRate[]> => {
    const { data, error } = await supabase.functions.invoke('exchange-rates', {
      method: 'POST'
    });
    
    if (error) throw error;
    return data?.rates || [];
  };

  // Initial fetch on component mount
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        setLoading(true);
        
        // First try to get from database
        const dbRates = await fetchExchangeRatesFromDB();
        
        if (dbRates.length > 0) {
          setExchangeRates(dbRates);
          setLastUpdate(dbRates[0].update_date);
          console.log("Exchange rates loaded from database:", dbRates.length);
          return;
        }
        
        // If no data in database, try to fetch fresh rates
        console.log("No rates in database, fetching fresh rates");
        try {
          const freshRates = await fetchFreshRates();
          setExchangeRates(freshRates);
          setLastUpdate(freshRates[0]?.update_date || new Date().toISOString().split('T')[0]);
          console.log("Fresh exchange rates loaded:", freshRates.length);
        } catch (freshError) {
          console.error("Failed to fetch fresh rates:", freshError);
          // Use fallback rates
          setExchangeRates(fallbackRates);
          setLastUpdate(fallbackRates[0].update_date);
          console.log("Using fallback exchange rates");
        }
      } catch (err) {
        console.error("Error loading exchange rates:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Use fallback rates
        setExchangeRates(fallbackRates);
        setLastUpdate(fallbackRates[0].update_date);
      } finally {
        setLoading(false);
      }
    };

    loadExchangeRates();
  }, []);

  // Function to manually refresh exchange rates
  const refreshExchangeRates = async () => {
    try {
      setLoading(true);
      toast.info('Döviz kurları güncelleniyor...', {
        duration: 2000
      });
      
      const freshRates = await fetchFreshRates();
      
      if (freshRates.length > 0) {
        setExchangeRates(freshRates);
        setLastUpdate(freshRates[0].update_date);
        
        toast.success('Döviz kurları başarıyla güncellendi', {
          description: `${freshRates.length} adet kur bilgisi alındı.`,
        });
        return;
      }
      
      // If no fresh rates, try database again
      const dbRates = await fetchExchangeRatesFromDB();
      
      if (dbRates.length > 0) {
        setExchangeRates(dbRates);
        setLastUpdate(dbRates[0].update_date);
        
        toast.info('Mevcut kur bilgileri yüklendi', {
          description: `Son güncelleme tarihi: ${new Date(dbRates[0].update_date).toLocaleDateString('tr-TR')}`,
        });
        return;
      }
      
      // Last resort - use fallback rates
      setExchangeRates(fallbackRates);
      setLastUpdate(fallbackRates[0].update_date);
      
      toast.warning('Varsayılan kurlar kullanılıyor', {
        description: 'Güncel kurlar alınamadı, geçici referans değerler kullanılıyor.',
      });
    } catch (err) {
      console.error("Error refreshing exchange rates:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast.error('Döviz kurları güncelleme hatası', {
        description: err instanceof Error ? err.message : 'Bilinmeyen hata',
      });
      
      // Fallback to default rates
      setExchangeRates(fallbackRates);
      setLastUpdate(fallbackRates[0].update_date);
    } finally {
      setLoading(false);
    }
  };

  // Get a simple map of currency codes to rates (for easier use in calculations)
  const getRatesMap = () => {
    const ratesMap: Record<string, number> = { TRY: 1 };
    
    exchangeRates.forEach(rate => {
      if (rate.currency_code && rate.forex_buying) {
        ratesMap[rate.currency_code] = rate.forex_buying;
      }
    });
    
    return ratesMap;
  };

  // Convert amount between currencies
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const rates = getRatesMap();
    
    // Convert to TRY first (base currency)
    const amountInTRY = fromCurrency === 'TRY' 
      ? amount 
      : amount * (rates[fromCurrency] || 1);
    
    // Then convert from TRY to target currency
    return toCurrency === 'TRY' 
      ? amountInTRY 
      : amountInTRY / (rates[toCurrency] || 1);
  };

  // Format currency with proper symbol
  const formatCurrency = (amount: number, currencyCode = 'TRY'): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  return {
    exchangeRates,
    loading,
    error,
    lastUpdate,
    refreshExchangeRates,
    getRatesMap,
    convertCurrency,
    formatCurrency
  };
};
