
import { DEFAULT_EXCHANGE_RATES } from "../proposalItemsConstants";

/**
 * Convert amount between currencies
 */
export const convertCurrency = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string,
  exchangeRates: {[key: string]: number} = DEFAULT_EXCHANGE_RATES
) => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert from source currency to TRY first (base currency)
  const amountInTRY = amount / exchangeRates[fromCurrency];
  
  // Then convert from TRY to target currency
  return amountInTRY * exchangeRates[toCurrency];
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = "TRY") => {
  // Check if currency is valid (might be undefined or object)
  if (!currency || typeof currency !== 'string') {
    currency = "TRY";
  }
  
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
};
