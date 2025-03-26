
import { useState } from "react";
import { toast } from "sonner";
import { getCurrencyOptions } from "../../utils/currencyUtils";

export const useCurrencyState = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");
  
  // Get currency options for select inputs
  const currencyOptions = getCurrencyOptions();
  
  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    if (value === selectedCurrency) return;
    
    setSelectedCurrency(value);
    toast.success(`Para birimi ${value} olarak değiştirildi`);
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    currencyOptions,
    handleCurrencyChange
  };
};
