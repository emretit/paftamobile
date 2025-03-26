
import { ExchangeRate } from './types';

export const fallbackRates: ExchangeRate[] = [
  {
    id: "fallback-try",
    currency_code: "TRY",
    forex_buying: 1,
    forex_selling: 1,
    banknote_buying: 1,
    banknote_selling: 1,
    cross_rate: null,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-usd",
    currency_code: "USD",
    forex_buying: 32.5,
    forex_selling: 32.7,
    banknote_buying: 32.4,
    banknote_selling: 32.8,
    cross_rate: 1,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-eur",
    currency_code: "EUR",
    forex_buying: 35.2,
    forex_selling: 35.4,
    banknote_buying: 35.1,
    banknote_selling: 35.5,
    cross_rate: 1.08,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-gbp",
    currency_code: "GBP",
    forex_buying: 41.3,
    forex_selling: 41.5,
    banknote_buying: 41.2,
    banknote_selling: 41.6,
    cross_rate: 1.27,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-chf",
    currency_code: "CHF",
    forex_buying: 36.1,
    forex_selling: 36.3,
    banknote_buying: 36.0,
    banknote_selling: 36.4,
    cross_rate: 1.11,
    update_date: new Date().toISOString().split('T')[0]
  },
  {
    id: "fallback-jpy",
    currency_code: "JPY",
    forex_buying: 0.21,
    forex_selling: 0.22,
    banknote_buying: 0.21,
    banknote_selling: 0.22,
    cross_rate: 0.0065,
    update_date: new Date().toISOString().split('T')[0]
  }
];
