
export const convertCurrency = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRates: {[key: string]: number}
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to base currency (TRY) first
  const amountInTRY = amount * exchangeRates[fromCurrency];
  
  // Then convert from TRY to target currency
  return amountInTRY / exchangeRates[toCurrency];
};

// Format a number as currency
export const formatCurrencyValue = (amount: number, currency: string = "TRY"): string => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: currency 
  }).format(amount);
};

// Get currency symbol
export const getCurrencySymbol = (currency: string = "TRY"): string => {
  const symbols: Record<string, string> = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
    GBP: "£"
  };
  
  return symbols[currency] || currency;
};
