
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { XMLParser } from "fast-xml-parser";
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

// Mock döviz kuru verileri - API çalışmadığında kullanılacak
const mockExchangeRates: ExchangeRate[] = [
  {
    id: "mock-try",
    currency_code: "TRY",
    forex_buying: 1,
    forex_selling: 1,
    banknote_buying: 1,
    banknote_selling: 1,
    cross_rate: null,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "mock-usd",
    currency_code: "USD",
    forex_buying: 32.5,
    forex_selling: 32.7,
    banknote_buying: 32.4,
    banknote_selling: 32.8,
    cross_rate: 1,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "mock-eur",
    currency_code: "EUR",
    forex_buying: 35.2,
    forex_selling: 35.4,
    banknote_buying: 35.1,
    banknote_selling: 35.5,
    cross_rate: 1.08,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "mock-gbp",
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

  // Parse XML and extract exchange rates
  const parseExchangeRates = (xmlText: string): ExchangeRate[] => {
    try {
      // Create a parser instance with options
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      });
      
      // Parse the XML
      const parsedData = parser.parse(xmlText);
      
      // Extract the Tarih_Date from the parsed data
      const tarihDate = parsedData.Tarih_Date;
      const updateDate = tarihDate['@_Date'] || new Date().toISOString().split('T')[0];
      
      // Define the currencies we want to extract
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'RUB', 'CNY', 'SAR', 'NOK', 'DKK', 'SEK'];
      const exchangeRates: ExchangeRate[] = [];
      
      // Add TRY base currency
      exchangeRates.push({
        id: `tcmb-try-${updateDate}`,
        currency_code: 'TRY',
        forex_buying: 1,
        forex_selling: 1,
        banknote_buying: 1,
        banknote_selling: 1,
        cross_rate: null,
        update_date: updateDate
      });
      
      // Check if Tarih_Date.Currency is an array
      const currencyList = Array.isArray(tarihDate.Currency) 
        ? tarihDate.Currency 
        : [tarihDate.Currency];
      
      // Extract data for each currency
      for (const currencyData of currencyList) {
        const currencyCode = currencyData['@_CurrencyCode'];
        
        // Only process currencies we're interested in
        if (currencies.includes(currencyCode)) {
          exchangeRates.push({
            id: `tcmb-${currencyCode.toLowerCase()}-${updateDate}`,
            currency_code: currencyCode,
            forex_buying: parseFloat(currencyData.ForexBuying?.replace(',', '.') || '0') || null,
            forex_selling: parseFloat(currencyData.ForexSelling?.replace(',', '.') || '0') || null,
            banknote_buying: parseFloat(currencyData.BanknoteBuying?.replace(',', '.') || '0') || null,
            banknote_selling: parseFloat(currencyData.BanknoteSelling?.replace(',', '.') || '0') || null,
            cross_rate: parseFloat(currencyData.CrossRateUSD?.replace(',', '.') || '0') || null,
            update_date: updateDate
          });
        }
      }
      
      console.log(`Başarıyla ${exchangeRates.length} adet döviz kuru işlendi`);
      return exchangeRates;
    } catch (err) {
      console.error('XML işlenirken hata oluştu:', err);
      throw new Error('XML işlenirken hata oluştu');
    }
  };

  // Store exchange rates in the database
  const storeExchangeRates = async (rates: ExchangeRate[]) => {
    try {
      const today = rates[0].update_date;
      
      // First, check if we already have rates for today
      const { data: existingRates } = await supabase
        .from('exchange_rates')
        .select('id')
        .eq('update_date', today)
        .limit(1);
      
      // If we have rates for today, delete them
      if (existingRates && existingRates.length > 0) {
        console.log(`${today} tarihli mevcut kurlar siliniyor...`);
        await supabase
          .from('exchange_rates')
          .delete()
          .eq('update_date', today);
      }
      
      // Insert new rates
      console.log(`${rates.length} adet döviz kuru ekleniyor...`);
      const { data, error } = await supabase
        .from('exchange_rates')
        .insert(rates)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Record the update in the exchange_rate_updates table if it exists
      try {
        await supabase
          .from('exchange_rate_updates')
          .insert({
            status: 'success',
            updated_at: new Date().toISOString(),
            message: 'Döviz kurları TCMB\'den başarıyla güncellendi',
            count: rates.length
          });
        console.log('Güncelleme exchange_rate_updates tablosuna kaydedildi');
      } catch (error) {
        // This is not critical, so just log the error
        console.warn('Güncelleme exchange_rate_updates tablosuna kaydedilemedi:', error);
      }
      
      return data;
    } catch (err) {
      console.error('Döviz kurları veritabanına kaydedilirken hata oluştu:', err);
      throw err;
    }
  };

  // Fetch TCMB exchange rates
  const fetchTCMBExchangeRates = async (): Promise<ExchangeRate[]> => {
    try {
      console.log('TCMB döviz kurları alınıyor...');
      const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.error(`HTTP hatası! Durum: ${response.status}`);
        throw new Error(`HTTP hatası! Durum: ${response.status}`);
      }
      
      // Get the XML as text
      const xmlText = await response.text();
      console.log('TCMB\'den XML verisi başarıyla alındı');
      
      // Parse exchange rates
      return parseExchangeRates(xmlText);
    } catch (error) {
      console.error('TCMB döviz kurları alınırken hata oluştu:', error);
      throw error;
    }
  };

  // Fetch initial exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        
        // First try to fetch from the database
        const { data: rates, error } = await supabase
          .from('exchange_rates')
          .select('*')
          .order('update_date', { ascending: false });

        if (error) {
          throw error;
        }

        if (rates && rates.length > 0) {
          setExchangeRates(rates);
          setLastUpdate(rates[0].update_date);
          console.log("Veritabanından kur bilgileri yüklendi:", rates.length);
          return;
        }
        
        // If no data in database, try to fetch from TCMB
        console.log("Veritabanında kur bilgisi bulunamadı, TCMB'den alınıyor");
        const tcmbRates = await fetchTCMBExchangeRates();
        
        // Store rates in database
        await storeExchangeRates(tcmbRates);
        
        setExchangeRates(tcmbRates);
        setLastUpdate(tcmbRates[0].update_date);
        console.log("TCMB'den kur bilgileri yüklendi:", tcmbRates.length);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
        console.error('Döviz kurları yüklenirken hata oluştu:', err);
        setError(err instanceof Error ? err : new Error(errorMessage));
        
        // Hata durumunda mock verileri kullan
        console.log("Hata nedeniyle mock veriler kullanılıyor");
        setExchangeRates(mockExchangeRates);
        setLastUpdate(mockExchangeRates[0].update_date);
        
        // Sadece veritabanı hatası varsa bildirim göster, mock veriler kullanıldığı için
        // kullanıcıya hata göstermiyoruz
        if (err instanceof Error && err.message.includes("database")) {
          toast.error('Döviz kurları alınamadı', {
            description: errorMessage,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  // Manually refresh exchange rates
  const refreshExchangeRates = async () => {
    try {
      setLoading(true);
      toast.info('Döviz kurları güncelleniyor...', {
        duration: 2000
      });
      
      // Fetch fresh rates from TCMB
      const freshRates = await fetchTCMBExchangeRates();
      
      // Store in database
      await storeExchangeRates(freshRates);
      
      setExchangeRates(freshRates);
      setLastUpdate(freshRates[0].update_date);
      
      toast.success('Döviz kurları başarıyla güncellendi', {
        description: `${freshRates.length} adet kur bilgisi TCMB'den alındı.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      console.error('Döviz kurları güncellenirken hata oluştu:', err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast.warning('Döviz kurları güncelleme hatası', {
        description: errorMessage,
      });
      
      // If we failed to refresh, try to get latest from database
      try {
        const { data: latestRates } = await supabase
          .from('exchange_rates')
          .select('*')
          .order('update_date', { ascending: false });
          
        if (latestRates && latestRates.length > 0) {
          setExchangeRates(latestRates);
          setLastUpdate(latestRates[0].update_date);
          return;
        }
        
        // If still no data, use mock data
        setExchangeRates(mockExchangeRates);
        setLastUpdate(mockExchangeRates[0].update_date);
      } catch (dbErr) {
        // Last resort - use mock data
        setExchangeRates(mockExchangeRates);
        setLastUpdate(mockExchangeRates[0].update_date);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    exchangeRates,
    loading,
    error,
    lastUpdate,
    refreshExchangeRates
  };
};
