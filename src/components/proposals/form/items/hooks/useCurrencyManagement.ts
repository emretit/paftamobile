
import { useState } from "react";
import { DEFAULT_EXCHANGE_RATES } from "../proposalItemsConstants";
import { formatCurrency } from "../utils/currencyUtils";

export const useCurrencyManagement = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");
  const [exchangeRates] = useState<{[key: string]: number}>(DEFAULT_EXCHANGE_RATES);

  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    formatCurrency,
    handleCurrencyChange
  };
};
