
export interface ExchangeRate {
  currency_code: string;
  forex_buying: number | null;
  forex_selling: number | null;
  banknote_buying: number | null;
  banknote_selling: number | null;
  cross_rate: number | null;
  update_date: string;
}

export interface UpdateStatus {
  status: string;
  message: string;
}
