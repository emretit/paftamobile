
import { ExchangeRate } from "../types/exchangeRateTypes";

export const getCurrencyIcon = (code: string): string => {
  const icons: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'TRY': '₺',
    'JPY': '¥',
    'CHF': 'Fr',
    'CAD': 'C$',
    'AUD': 'A$',
    'CNY': '¥',
    'RUB': '₽',
    'SAR': '﷼',
    'NOK': 'kr',
    'DKK': 'kr',
    'SEK': 'kr'
  };
  return icons[code] || code;
};

export const getCurrencyName = (code: string): string => {
  const names: Record<string, string> = {
    'USD': 'Amerikan Doları',
    'EUR': 'Euro',
    'GBP': 'İngiliz Sterlini',
    'TRY': 'Türk Lirası',
    'JPY': 'Japon Yeni',
    'CHF': 'İsviçre Frangı',
    'CAD': 'Kanada Doları',
    'AUD': 'Avustralya Doları',
    'CNY': 'Çin Yuanı',
    'RUB': 'Rus Rublesi',
    'SAR': 'Suudi Arabistan Riyali',
    'NOK': 'Norveç Kronu',
    'DKK': 'Danimarka Kronu',
    'SEK': 'İsveç Kronu'
  };
  return names[code] || code;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getFallbackRates = (): ExchangeRate[] => {
  const today = new Date().toISOString();
  return [
    {
      currency_code: 'USD',
      forex_buying: 32.5,
      forex_selling: 32.7,
      banknote_buying: 32.4,
      banknote_selling: 32.8,
      cross_rate: null,
      update_date: today
    },
    {
      currency_code: 'EUR',
      forex_buying: 35.2,
      forex_selling: 35.4,
      banknote_buying: 35.1,
      banknote_selling: 35.5,
      cross_rate: null,
      update_date: today
    },
    {
      currency_code: 'GBP',
      forex_buying: 41.3,
      forex_selling: 41.5,
      banknote_buying: 41.2,
      banknote_selling: 41.7,
      cross_rate: null,
      update_date: today
    },
    {
      currency_code: 'TRY',
      forex_buying: 1,
      forex_selling: 1,
      banknote_buying: 1,
      banknote_selling: 1,
      cross_rate: null,
      update_date: today
    }
  ];
};
