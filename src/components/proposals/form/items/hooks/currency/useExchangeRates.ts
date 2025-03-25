
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ExchangeRates } from "../../types/currencyTypes";
import { fetchTCMBExchangeRates } from "../../utils/currencyUtils";

export const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    GBP: 41.3
  });
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Fetch exchange rates when hook is initialized
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
    exchangeRates,
    isLoadingRates
  };
};
