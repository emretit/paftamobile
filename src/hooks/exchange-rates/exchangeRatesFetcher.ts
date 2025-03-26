import { supabase } from "@/integrations/supabase/client";
import { ExchangeRate, FetchError } from "./types";
import { toast } from "sonner";
import { fallbackRates } from "./fallbackRates";

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
    
    console.log('No exchange rates found in database, returning fallback rates');
    return fallbackRates;
  } catch (error) {
    console.error('Error fetching from database:', error);
    console.log('Returning fallback rates due to error');
    return fallbackRates;
  }
};

export const invokeEdgeFunction = async (): Promise<ExchangeRate[]> => {
  console.log('Edge function removed, using fallback rates');
  return fallbackRates;
};
