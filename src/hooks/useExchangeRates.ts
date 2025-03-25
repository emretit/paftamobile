
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

export const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Fetch initial exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        
        // Fetch the latest exchange rates
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
        } else {
          // If no data in database, try the edge function
          try {
            const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-exchange-rates', {
              method: 'GET'
            });
            
            if (functionError) {
              throw functionError;
            }
            
            if (functionData && functionData.data) {
              setExchangeRates(functionData.data);
              setLastUpdate(functionData.update_date);
            } else {
              throw new Error('No exchange rate data available');
            }
          } catch (functionErr) {
            console.error("Error fetching from function:", functionErr);
            throw new Error('Could not fetch exchange rates from alternative source');
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching exchange rates';
        console.error('Error fetching exchange rates:', err);
        setError(err instanceof Error ? err : new Error(errorMessage));
        toast.error('Döviz kurları alınamadı', {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('exchange_rates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exchange_rates',
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // Refresh data when changes are detected
          fetchExchangeRates();
          toast.info('Döviz kurları güncellendi', {
            description: 'En güncel kurlar yüklendi.',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Manually refresh exchange rates
  const refreshExchangeRates = async () => {
    try {
      setLoading(true);
      
      // Trigger the edge function to fetch new data
      const { data, error } = await supabase.functions.invoke('fetch-exchange-rates', {
        method: 'POST'
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Döviz kurları başarıyla güncellendi', {
        description: `${data?.count || 0} adet kur bilgisi yüklendi.`,
      });
      
      // Fetch fresh data after update
      const { data: freshRates, error: fetchError } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('update_date', { ascending: false });
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (freshRates && freshRates.length > 0) {
        setExchangeRates(freshRates);
        setLastUpdate(freshRates[0].update_date);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error refreshing exchange rates';
      console.error('Error refreshing exchange rates:', err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error('Döviz kurları güncellenemedi', {
        description: errorMessage,
      });
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
