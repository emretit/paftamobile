
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
