
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExchangeRate {
  id: string;
  currency_code: string;
  forex_buying: number | null;
  forex_selling: number | null;
  banknote_buying: number | null;
  banknote_selling: number | null;
  update_date: string;
  created_at: string;
  updated_at: string;
}

export const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchRatesFromDatabase = async () => {
    try {
      // First, get the most recent update date
      const { data: dateData, error: dateError } = await supabase
        .from('exchange_rates')
        .select('update_date')
        .order('update_date', { ascending: false })
        .limit(1);

      if (dateError) throw dateError;
      
      if (!dateData || dateData.length === 0) {
        console.info("No exchange rates found in database");
        return [];
      }
      
      const mostRecentDate = dateData[0].update_date;
      setLastUpdate(mostRecentDate);
      
      // Then get all rates for that date
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('update_date', mostRecentDate);
        
      if (error) throw error;
      
      console.info(`Successfully fetched rates from DB: ${data?.length}`);
      return data || [];
    } catch (error) {
      console.error("Error fetching exchange rates from database:", error);
      throw error;
    }
  };

  const fetchRates = useCallback(async (showToast = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get rates from the database
      const dbRates = await fetchRatesFromDatabase();
      
      if (dbRates && dbRates.length > 0) {
        setExchangeRates(dbRates);
        console.info("Exchange rates loaded via Database:", dbRates.length);
        if (showToast) {
          toast.success("Döviz kurları başarıyla güncellendi");
        }
        return;
      }
      
      // If no rates in DB, fetch from the edge function
      console.info("Invoking exchange-rates edge function...");
      const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-tcmb-rates');
      
      if (functionError) throw functionError;
      
      if (functionData?.success) {
        console.info("Successfully received data from edge function:", functionData.count);
        
        // Refetch from database after the edge function has updated it
        const updatedRates = await fetchRatesFromDatabase();
        setExchangeRates(updatedRates);
        
        if (showToast) {
          toast.success("Döviz kurları başarıyla güncellendi");
        }
      } else {
        throw new Error(functionData?.error || "Unknown error fetching exchange rates");
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      
      if (showToast) {
        toast.error("Döviz kurları güncellenirken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshExchangeRates = useCallback(() => {
    return fetchRates(true);
  }, [fetchRates]);

  useEffect(() => {
    fetchRates();
    
    // Set up realtime subscription for exchange_rates table
    try {
      const channel = supabase
        .channel('exchange-rates-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'exchange_rates',
          },
          (payload) => {
            console.log('Exchange rates updated via realtime:', payload);
            fetchRates();
          }
        )
        .subscribe();
      
      console.info("Realtime subscription status:", channel.state);
      
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.warn("Failed to enable realtime:", error);
    }
  }, [fetchRates]);

  return {
    exchangeRates,
    loading,
    error,
    lastUpdate,
    refreshExchangeRates
  };
};
