
import { useState } from "react";

// Simplified currency options
const getCurrencyOptions = () => {
  return [
    { value: "TRY", label: "₺ TRY", symbol: "₺" }
  ];
};

// Format currency
const formatCurrency = (amount: number, currency: string = "TRY") => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Get currency symbol
const getCurrencySymbol = (currency: string = "TRY") => {
  const symbols: Record<string, string> = {
    TRY: '₺'
  };
  return symbols[currency] || currency;
};

export const useCurrencyManagement = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");
  
  // Currency options for select inputs
  const currencyOptions = getCurrencyOptions();
  
  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    // Only TRY is supported now
    setSelectedCurrency("TRY");
  };

  // Convert amount between currencies (simplified to just return the amount since we only support TRY)
  const convertAmount = (amount: number) => {
    return amount;
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    currencyOptions,
    formatCurrency,
    getCurrencySymbol,
    handleCurrencyChange,
    convertAmount,
    isLoadingRates: false
  };
};
