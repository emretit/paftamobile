
import { useExchangeRates } from "./currency/useExchangeRates";
import { useCurrencyFormatter } from "./currency/useCurrencyFormatter";
import { useCurrencyConverter } from "./currency/useCurrencyConverter";
import { useCurrencyState } from "./currency/useCurrencyState";

export const useCurrencyManagement = () => {
  const { exchangeRates, isLoadingRates } = useExchangeRates();
  const { formatCurrency, getCurrencySymbol } = useCurrencyFormatter();
  const { convertAmount } = useCurrencyConverter(exchangeRates);
  const { 
    selectedCurrency, 
    setSelectedCurrency, 
    currencyOptions, 
    handleCurrencyChange 
  } = useCurrencyState();

  return {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    currencyOptions,
    formatCurrency,
    getCurrencySymbol,
    handleCurrencyChange,
    convertAmount,
    isLoadingRates
  };
};
