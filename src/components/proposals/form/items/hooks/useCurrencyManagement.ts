
import { useState, useEffect } from "react";

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

  // Format currency
  const formatCurrency = (amount: number, currency: string = selectedCurrency) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    formatCurrency,
    handleCurrencyChange
  };
};
