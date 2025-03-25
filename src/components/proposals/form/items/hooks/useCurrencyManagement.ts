
import { useState, useEffect } from "react";
import { formatCurrencyValue, getCurrencyOptions, getCurrencySymbol, fetchTCMBExchangeRates } from "../utils/currencyUtils";
import { toast } from "sonner";

export const useCurrencyManagement = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");
  const [exchangeRates, setExchangeRates] = useState({
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    GBP: 41.3
  });
  const [isLoadingRates, setIsLoadingRates] = useState(false);

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

  // Fetch exchange rates from TCMB when component mounts
  useEffect(() => {
    const getExchangeRates = async () => {
      setIsLoadingRates(true);
      try {
        const rates = await fetchTCMBExchangeRates();
        // Ensure all required currencies exist in the rates object
        const completeRates = {
          TRY: rates.TRY || 1,
          USD: rates.USD || 32.5,
          EUR: rates.EUR || 35.2,
          GBP: rates.GBP || 41.3
        };
        setExchangeRates(completeRates);
        console.log("TCMB Exchange rates loaded:", completeRates);
        toast.success("Güncel döviz kurları yüklendi");
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
        toast.error("Döviz kurları yüklenemedi, varsayılan değerler kullanılıyor");
      } finally {
        setIsLoadingRates(false);
      }
    };

    getExchangeRates();
  }, []);

  return {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    currencyOptions,
    formatCurrency,
    getCurrencySymbol: getCurrencySymbolValue,
    handleCurrencyChange,
    isLoadingRates
  };
};
