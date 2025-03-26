import { supabase } from "@/integrations/supabase/client";
import { ExchangeRates } from "../types/currencyTypes";

export const getCurrencySymbol = (currency: string = "TRY"): string => {
  const symbols: { [key: string]: string } = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CHF: "₣"
  };
  
  return symbols[currency] || currency;
};

export const formatCurrencyValue = (
  amount: number,
  currency: string = "TRY"
): string => {
  try {
    const formatter = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    });
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback for invalid currency codes
    return `${getCurrencySymbol(currency)} ${amount.toFixed(2)}`;
  }
};

// Get current exchange rates from memory or fetch them
let cachedRates: ExchangeRates | null = null;
let lastFetchTime = 0;

export const getCurrentExchangeRates = (): ExchangeRates => {
  // If we have cached rates that are less than 10 minutes old, use them
  const now = Date.now();
  if (cachedRates && (now - lastFetchTime < 10 * 60 * 1000)) {
    return cachedRates;
  }
  
  // Otherwise use default rates
  return getDefaultExchangeRates();
};

// Format exchange rate display
export const formatExchangeRate = (
  fromCurrency: string, 
  toCurrency: string, 
  rate: number
): string => {
  return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
};

// Get exchange rates from database or use defaults
export const fetchTCMBExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    // Get most recent date
    const { data: dateData, error: dateError } = await supabase
      .from('exchange_rates')
      .select('update_date')
      .order('update_date', { ascending: false })
      .limit(1);
      
    if (dateError) throw dateError;
    
    if (!dateData || dateData.length === 0) {
      console.warn("No exchange rate data found, using defaults");
      return getDefaultExchangeRates();
    }
    
    const mostRecentDate = dateData[0].update_date;
    
    // Get rates for that date
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('update_date', mostRecentDate);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.warn("No exchange rate data found for date", mostRecentDate, "using defaults");
      return getDefaultExchangeRates();
    }
    
    // Convert to ExchangeRates object
    const rates: ExchangeRates = { TRY: 1 };
    
    data.forEach(rate => {
      if (rate.currency_code && rate.forex_selling) {
        rates[rate.currency_code] = rate.forex_selling;
      }
    });
    
    // Ensure we have the base currency
    if (!rates.TRY) {
      rates.TRY = 1;
    }
    
    // Update cache
    cachedRates = rates;
    lastFetchTime = Date.now();
    
    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return getDefaultExchangeRates();
  }
};

// Convert amount between currencies
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: ExchangeRates
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Ensure we have exchange rates
  const rates = { ...exchangeRates };
  if (!rates.TRY) rates.TRY = 1;
  
  // If rates are missing, use defaults
  if (!rates[fromCurrency] || !rates[toCurrency]) {
    const defaultRates = getDefaultExchangeRates();
    if (!rates[fromCurrency]) rates[fromCurrency] = defaultRates[fromCurrency] || 1;
    if (!rates[toCurrency]) rates[toCurrency] = defaultRates[toCurrency] || 1;
  }
  
  // Convert to TRY first (base currency)
  const amountInTRY = fromCurrency === "TRY" 
    ? amount 
    : amount * (1 / rates[fromCurrency]);
  
  // Then convert from TRY to target currency
  return toCurrency === "TRY" 
    ? amountInTRY 
    : amountInTRY * rates[toCurrency];
};

// Get currency options for dropdown menus
export const getCurrencyOptions = () => {
  return [
    { value: "TRY", label: "Türk Lirası (₺)", symbol: "₺" },
    { value: "USD", label: "US Dollar ($)", symbol: "$" },
    { value: "EUR", label: "Euro (€)", symbol: "€" },
    { value: "GBP", label: "British Pound (£)", symbol: "£" }
  ];
};

// Default exchange rates as fallback
export const getDefaultExchangeRates = (): ExchangeRates => {
  return {
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    GBP: 41.3
  };
};
