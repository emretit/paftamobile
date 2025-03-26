
import { useState, useEffect } from "react";
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

// Direct TCMB XML parser function
const parseTCMBExchangeRates = (xmlText: string): ExchangeRate[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Get the date
    const tarihNode = xmlDoc.getElementsByTagName("Tarih_Date")[0];
    const updateDate = tarihNode.getAttribute("Date") || new Date().toISOString().split('T')[0];

    // Define the currencies we want to extract
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'RUB', 'CNY', 'SAR', 'NOK', 'DKK', 'SEK'];
    const exchangeRates: ExchangeRate[] = [];
    
    // Add TRY base currency
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
    
    // Get all Currency nodes
    const currencyNodes = xmlDoc.getElementsByTagName("Currency");
    
    for (let i = 0; i < currencyNodes.length; i++) {
      const currencyNode = currencyNodes[i];
      const currencyCode = currencyNode.getAttribute("CurrencyCode");
      
      // Only process currencies we're interested in
      if (currencies.includes(currencyCode || '')) {
        // Parse all values, handling comma decimal separator
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

export const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  // Load exchange rates directly from TCMB
  const fetchExchangeRates = async (): Promise<ExchangeRate[]> => {
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

  // Initial fetch on component mount
  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        setLoading(true);
        
        // Get rates from TCMB
        const rates = await fetchExchangeRates();
        
        if (rates.length > 0) {
          setExchangeRates(rates);
          setLastUpdate(rates[0].update_date);
          console.log("Exchange rates loaded:", rates.length);
        } else {
          // Use fallback rates if no data
          setExchangeRates(fallbackRates);
          setLastUpdate(fallbackRates[0].update_date);
          console.log("Using fallback exchange rates (no data)");
        }
      } catch (err) {
        console.error("Error loading exchange rates:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Use fallback rates
        setExchangeRates(fallbackRates);
        setLastUpdate(fallbackRates[0].update_date);
        console.log("Using fallback exchange rates (error)");
      } finally {
        setLoading(false);
      }
    };

    loadExchangeRates();
    
    // Set up auto-refresh every 6 hours
    const refreshInterval = setInterval(() => {
      loadExchangeRates();
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Function to manually refresh exchange rates
  const refreshExchangeRates = async () => {
    try {
      setLoading(true);
      toast.info('Döviz kurları güncelleniyor...', {
        duration: 2000
      });
      
      const rates = await fetchExchangeRates();
      
      if (rates.length > 0) {
        setExchangeRates(rates);
        setLastUpdate(rates[0].update_date);
        
        toast.success('Döviz kurları başarıyla güncellendi', {
          description: `${rates.length} adet kur bilgisi alındı.`,
        });
      } else {
        // If no data, use fallback rates
        setExchangeRates(fallbackRates);
        setLastUpdate(fallbackRates[0].update_date);
        
        toast.warning('Varsayılan kurlar kullanılıyor', {
          description: 'Güncel kurlar alınamadı, geçici referans değerler kullanılıyor.',
        });
      }
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
