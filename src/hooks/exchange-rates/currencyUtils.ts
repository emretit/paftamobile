
import { ExchangeRatesMap } from "./types";

export const getRatesMap = (exchangeRates: any[]): ExchangeRatesMap => {
  const ratesMap: ExchangeRatesMap = { TRY: 1 };
  
  exchangeRates.forEach(rate => {
    if (rate.currency_code && rate.forex_buying) {
      ratesMap[rate.currency_code] = rate.forex_buying;
    }
  });
  
  return ratesMap;
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRatesMap
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const amountInTRY = fromCurrency === 'TRY' 
    ? amount 
    : amount * (rates[fromCurrency] || 1);
  
  return toCurrency === 'TRY' 
    ? amountInTRY 
    : amountInTRY / (rates[toCurrency] || 1);
};

export const formatCurrency = (amount: number, currencyCode = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};
