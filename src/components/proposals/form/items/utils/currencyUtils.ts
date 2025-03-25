
import { ExchangeRates, CurrencyOption } from "../types/currencyTypes";

// Format a currency value for display
export const formatCurrencyValue = (amount: number, currency: string = "TRY"): string => {
  // Ensure currency is not empty to avoid Intl.NumberFormat errors
  if (!currency) currency = "TRY";
  
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

// Convert an amount from one currency to another
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number => {
  // If currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) return amount;
  
  // Handle TRY as the base currency 
  if (fromCurrency === "TRY") {
    return amount / (rates[toCurrency] || 1);
  }
  
  // Convert from source currency to TRY first, then to target currency
  const amountInTRY = amount * (rates[fromCurrency] || 1);
  return toCurrency === "TRY" ? amountInTRY : amountInTRY / (rates[toCurrency] || 1);
};

// Format a price with a specified number of decimal places
export const formatPrice = (price: number, decimals: number = 2): string => {
  return price.toFixed(decimals);
};

// Add currency symbol to a formatted price
export const addCurrencySymbol = (price: string, currency: string): string => {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  
  return `${symbols[currency] || currency} ${price}`;
};

// Get currency symbol for a given currency code
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  
  return symbols[currency] || currency;
};

// Get currency options for dropdowns
export const getCurrencyOptions = (): CurrencyOption[] => {
  return [
    { value: "TRY", label: "₺ TRY", symbol: "₺" },
    { value: "USD", label: "$ USD", symbol: "$" },
    { value: "EUR", label: "€ EUR", symbol: "€" },
    { value: "GBP", label: "£ GBP", symbol: "£" }
  ];
};
