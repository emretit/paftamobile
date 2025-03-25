
import { ExchangeRate } from "../types/exchangeRateTypes";

export const formatDate = (dateString: string) => {
  // Handle both date-only and full ISO timestamp formats
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Tarih bilgisi mevcut değil';
  }
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  try {
    return date.toLocaleDateString('tr-TR', options);
  } catch (e) {
    // Fallback formatting if Turkish locale is not available
    return date.toLocaleString();
  }
};

export const getCurrencyName = (code: string): string => {
  const names: Record<string, string> = {
    'USD': 'ABD Doları',
    'EUR': 'Euro',
    'GBP': 'İngiliz Sterlini',
    'TRY': 'Türk Lirası',
    'JPY': 'Japon Yeni',
    'CHF': 'İsviçre Frangı',
    'CAD': 'Kanada Doları',
    'AUD': 'Avustralya Doları',
    'RUB': 'Rus Rublesi',
    'CNY': 'Çin Yuanı',
    'SAR': 'Suudi Riyali',
    'NOK': 'Norveç Kronu',
    'DKK': 'Danimarka Kronu',
    'SEK': 'İsveç Kronu'
  };
  return names[code] || code;
};

export const getCurrencyIcon = (code: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'TRY': '₺',
    'JPY': '¥',
    'CHF': 'Fr',
    'CAD': 'C$',
    'AUD': 'A$',
    'RUB': '₽',
    'CNY': '¥',
    'SAR': '﷼‎',
    'NOK': 'kr',
    'DKK': 'kr',
    'SEK': 'kr'
  };
  return symbols[code] || code;
};

export const getFallbackRates = (): ExchangeRate[] => [
  { 
    currency_code: 'USD', 
    forex_buying: 32.5, 
    forex_selling: 32.8, 
    banknote_buying: null,
    banknote_selling: null,
    cross_rate: null,
    update_date: new Date().toISOString()
  },
  { 
    currency_code: 'EUR', 
    forex_buying: 35.2, 
    forex_selling: 35.5, 
    banknote_buying: null,
    banknote_selling: null,
    cross_rate: null,
    update_date: new Date().toISOString() 
  },
  { 
    currency_code: 'GBP', 
    forex_buying: 41.3, 
    forex_selling: 41.6, 
    banknote_buying: null,
    banknote_selling: null,
    cross_rate: null,
    update_date: new Date().toISOString() 
  },
  { 
    currency_code: 'TRY', 
    forex_buying: 1, 
    forex_selling: 1, 
    banknote_buying: null,
    banknote_selling: null,
    cross_rate: null,
    update_date: new Date().toISOString() 
  }
];
