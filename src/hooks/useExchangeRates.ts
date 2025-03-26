import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  },
  {
    id: "fallback-chf",
    currency_code: "CHF",
    forex_buying: 36.1,
    forex_selling: 36.3,
    banknote_buying: 36.0,
    banknote_selling: 36.4,
    cross_rate: 1.11,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-jpy",
    currency_code: "JPY",
    forex_buying: 0.21,
    forex_selling: 0.22,
    banknote_buying: 0.21,
    banknote_selling: 0.22,
    cross_rate: 0.0065,
    update_date: new Date().toISOString().split('T')[0]
  }
];

const parseTCMBExchangeRates = (xmlText: string): ExchangeRate[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const tarihNode = xmlDoc.getElementsByTagName("Tarih_Date")[0];
    const updateDate = tarihNode.getAttribute("Date") || new Date().toISOString().split('T')[0];

    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'RUB', 'CNY', 'SAR', 'NOK', 'DKK', 'SEK'];
    const exchangeRates: ExchangeRate[] = [];
    
    exchangeRates.push({
      id: `try-${Date.now()}`,
      currency_code: 'TRY',
      forex_buying: 1,
      forex_selling: 1,
      banknote_buying: 1,
      banknote_selling: 1,
      cross_rate: null,
      update_date: updateDate
    });
    
    const currencyNodes = xmlDoc.getElementsByTagName("Currency");
    
    for (let i = 0; i < currencyNodes.length; i++) {
      const currencyNode = currencyNodes[i];
      const currencyCode = currencyNode.getAttribute("CurrencyCode");
      
      if (currencies.includes(currencyCode || '')) {
        const parseCommaValue = (value: string | null): number | null => {
          if (!value) return null;
          return parseFloat(value.replace(',', '.'));
        };
        
        const forexBuyingNode = currencyNode.getElementsByTagName("ForexBuying")[0];
        const forexSellingNode = currencyNode.getElementsByTagName("ForexSelling")[0];
        const banknoteBuyingNode = currencyNode.getElementsByTagName("BanknoteBuying")[0];
        const banknoteSellingNode = currencyNode.getElementsByTagName("BanknoteSelling")[0];
        const crossRateNode = currencyNode.getElementsByTagName("CrossRateUSD")[0];
        
        exchangeRates.push({
          id: `${currencyCode}-${Date.now()}`,
          currency_code: currencyCode || '',
          forex_buying: parseCommaValue(forexBuyingNode?.textContent || null),
          forex_selling: parseCommaValue(forexSellingNode?.textContent || null),
          banknote_buying: parseCommaValue(banknoteBuyingNode?.textContent || null),
          banknote_selling: parseCommaValue(banknoteSellingNode?.textContent || null),
          cross_rate: parseCommaValue(crossRateNode?.textContent || null),
          update_date: updateDate
        });
      }
    }
    
    return exchangeRates;
  } catch (error) {
    console.error("Error parsing TCMB exchange rates:", error);
    throw new Error(`Failed to parse exchange rates: ${error}`);
  }
};

export const useExchangeRates = (pollingInterval = 300000) => { // 5 minutes by default
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const enableRealtime = async () => {
    try {
      const { error } = await supabase.functions.invoke('enable-realtime');
      if (error) {
        console.warn('Failed to enable realtime:', error);
      } else {
        console.log('Realtime enabled for exchange_rates table');
      }
    } catch (err) {
      console.warn('Error enabling realtime:', err);
    }
  };

  const fetchExchangeRatesFromDB = async (): Promise<ExchangeRate[]> => {
    try {
      const { data: latestDateData, error: dateError } = await supabase
        .from('exchange_rates')
        .select('update_date')
        .order('update_date', { ascending: false })
        .limit(1);
      
      if (dateError) {
        throw new Error(`Error fetching latest date: ${dateError.message}`);
      }
      
      if (latestDateData && latestDateData.length > 0) {
        const latestDate = latestDateData[0].update_date;
        
        const { data: rates, error: ratesError } = await supabase
          .from('exchange_rates')
          .select('*')
          .eq('update_date', latestDate);
        
        if (ratesError) {
          throw new Error(`Error fetching exchange rates: ${ratesError.message}`);
        }
        
        if (rates && rates.length > 0) {
          return rates as ExchangeRate[];
        }
      }
      
      throw new Error('No exchange rates found in database');
    } catch (error) {
      console.error('Error fetching from database:', error);
      throw error;
    }
  };
  
  const fetchExchangeRatesFromTCMB = async (): Promise<ExchangeRate[]> => {
    try {
      const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const xmlText = await response.text();
      return parseTCMBExchangeRates(xmlText);
    } catch (error) {
      console.error("Error fetching TCMB exchange rates:", error);
      throw error;
    }
  };
  
  const invokeEdgeFunction = async (): Promise<ExchangeRate[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('exchange-rates', {
        method: 'POST'
      });
      
      if (error) throw error;
      
      if (data && data.success && data.data) {
        return data.data as ExchangeRate[];
      }
      
      throw new Error('No data returned from edge function');
    } catch (error) {
      console.error('Error invoking edge function:', error);
      throw error;
    }
  };

  useEffect(() => {
    enableRealtime();
    
    const loadExchangeRates = async () => {
      try {
        setLoading(true);
        
        try {
          const dbRates = await fetchExchangeRatesFromDB();
          
          if (dbRates.length > 0) {
            setExchangeRates(dbRates);
            setLastUpdate(dbRates[0].update_date);
            console.log("Exchange rates loaded from database:", dbRates.length);
            return;
          }
        } catch (dbError) {
          console.warn("Couldn't fetch from database, trying TCMB directly:", dbError);
        }
        
        try {
          const tcmbRates = await fetchExchangeRatesFromTCMB();
          
          if (tcmbRates.length > 0) {
            setExchangeRates(tcmbRates);
            setLastUpdate(tcmbRates[0].update_date);
            console.log("Exchange rates loaded from TCMB XML:", tcmbRates.length);
            
            invokeEdgeFunction().catch(e => 
              console.warn("Background refresh of exchange rates failed:", e));
            
            return;
          }
        } catch (tcmbError) {
          console.warn("Couldn't fetch from TCMB directly, trying edge function:", tcmbError);
        }
        
        try {
          const functionRates = await invokeEdgeFunction();
          
          if (functionRates.length > 0) {
            setExchangeRates(functionRates);
            setLastUpdate(functionRates[0].update_date);
            console.log("Exchange rates loaded from edge function:", functionRates.length);
            return;
          }
        } catch (functionError) {
          console.error("Edge function also failed:", functionError);
          throw functionError;
        }
        
        setExchangeRates(fallbackRates);
        setLastUpdate(fallbackRates[0].update_date);
        console.warn("Using fallback exchange rates (all methods failed)");
        
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

    loadExchangeRates();
    
    const pollingTimer = setInterval(() => {
      console.log("Polling for exchange rate updates...");
      loadExchangeRates();
    }, pollingInterval);
    
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
      .subscribe();
    
    return () => {
      clearInterval(pollingTimer);
      supabase.removeChannel(channel);
    };
  }, [pollingInterval]);

  const refreshExchangeRates = async () => {
    try {
      setLoading(true);
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
      } else {
        const tcmbRates = await fetchExchangeRatesFromTCMB();
        
        if (tcmbRates.length > 0) {
          setExchangeRates(tcmbRates);
          setLastUpdate(tcmbRates[0].update_date);
          
          toast.success('Döviz kurları başarıyla güncellendi', {
            description: `${tcmbRates.length} adet kur bilgisi TCMB'den alındı.`,
          });
        } else {
          setExchangeRates(fallbackRates);
          setLastUpdate(fallbackRates[0].update_date);
          
          toast.warning('Varsayılan kurlar kullanılıyor', {
            description: 'Güncel kurlar alınamadı, geçici referans değerler kullanılıyor.',
          });
        }
      }
    } catch (err) {
      console.error("Error refreshing exchange rates:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast.error('Döviz kurları güncelleme hatası', {
        description: err instanceof Error ? err.message : 'Bilinmeyen hata',
      });
      
      setExchangeRates(fallbackRates);
      setLastUpdate(fallbackRates[0].update_date);
    } finally {
      setLoading(false);
    }
  };

  const getRatesMap = () => {
    const ratesMap: Record<string, number> = { TRY: 1 };
    
    exchangeRates.forEach(rate => {
      if (rate.currency_code && rate.forex_buying) {
        ratesMap[rate.currency_code] = rate.forex_buying;
      }
    });
    
    return ratesMap;
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const rates = getRatesMap();
    
    const amountInTRY = fromCurrency === 'TRY' 
      ? amount 
      : amount * (rates[fromCurrency] || 1);
    
    return toCurrency === 'TRY' 
      ? amountInTRY 
      : amountInTRY / (rates[toCurrency] || 1);
  };

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
