
import { supabase } from "@/integrations/supabase/client";
import { ExchangeRate, FetchError } from "./types";
import { toast } from "sonner";

export const fetchExchangeRatesFromDB = async (): Promise<ExchangeRate[]> => {
  try {
    console.log('Fetching exchange rates from database...');
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
        console.log('Successfully fetched rates from DB:', rates.length);
        return rates as ExchangeRate[];
      }
    }
    
    throw new Error('No exchange rates found in database');
  } catch (error) {
    console.error('Error fetching from database:', error);
    throw error;
  }
};

export const invokeEdgeFunction = async (): Promise<ExchangeRate[]> => {
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

export const enableRealtime = async () => {
  try {
    console.log('Enabling realtime for exchange_rates table...');
    const { data, error } = await supabase.functions.invoke('enable-realtime');
    
    if (error) {
      console.warn('Failed to enable realtime:', error);
    } else {
      console.log('Realtime response:', data);
    }
  } catch (err) {
    console.warn('Error enabling realtime:', err);
  }
};
