
import { useState, useEffect } from "react";
import { formatCurrencyValue, getCurrencyOptions, getCurrencySymbol } from "../utils/currencyUtils";
import { toast } from "sonner";

export const useCurrencyManagement = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");
  // Hard-coded exchange rates for demonstration purposes
  // In a real application, this would come from an API
  const [exchangeRates, setExchangeRates] = useState({
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    GBP: 41.3
  });

  // Get currency options for select inputs
  const currencyOptions = getCurrencyOptions();
  
  // Format currency
  const formatCurrency = (amount: number, currency: string = selectedCurrency) => {
    return formatCurrencyValue(amount, currency);
  };

  // Get currency symbol
  const getCurrencySymbolValue = (currency: string = selectedCurrency) => {
    return getCurrencySymbol(currency);
  };

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    toast.success(`Para birimi ${value} olarak değiştirildi`);
  };

  // Fetch exchange rates from an API
  useEffect(() => {
    // This would be replaced with an actual API call in a production environment
    const fetchExchangeRates = async () => {
      try {
        // In a real application, this would fetch the latest exchange rates
        // For now, we'll use the static rates defined above
        console.log("Exchange rates would be fetched here in production");
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      }
    };

    fetchExchangeRates();
  }, []);

  return {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    currencyOptions,
    formatCurrency,
    getCurrencySymbol: getCurrencySymbolValue,
    handleCurrencyChange
  };
};
