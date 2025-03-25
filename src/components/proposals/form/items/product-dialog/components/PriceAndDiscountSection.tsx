
import React, { useState, useEffect } from "react";
import { getCurrencyOptions, fetchTCMBExchangeRates } from "../../utils/currencyUtils";
import { toast } from "sonner";

// Import refactored components
import CurrencySelector from "./price-section/CurrencySelector";
import PriceInput from "./price-section/PriceInput";
import TaxRateSelector from "./price-section/TaxRateSelector";
import PriceSummary from "./price-section/PriceSummary";

interface PriceAndDiscountSectionProps {
  customPrice: number | undefined;
  setCustomPrice: (value: number | undefined) => void;
  discountRate: number;
  setDiscountRate: (value: number) => void;
  selectedCurrency: string;
  handleCurrencyChange: (value: string) => void;
  convertedPrice: number;
  originalCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const PriceAndDiscountSection: React.FC<PriceAndDiscountSectionProps> = ({
  customPrice,
  setCustomPrice,
  discountRate,
  setDiscountRate,
  selectedCurrency,
  handleCurrencyChange,
  convertedPrice,
  originalCurrency,
  formatCurrency
}) => {
  const currencyOptions = getCurrencyOptions();
  const [localPrice, setLocalPrice] = useState<number | string>(customPrice || convertedPrice);
  const [localDiscountRate, setLocalDiscountRate] = useState(discountRate);
  const [exchangeRates, setExchangeRates] = useState({
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    GBP: 41.3
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch exchange rates when component mounts
  useEffect(() => {
    const getExchangeRates = async () => {
      setIsLoading(true);
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
        console.log("Exchange rates updated:", completeRates);
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        toast.error("Güncel döviz kurları alınamadı, varsayılan değerler kullanılıyor");
      } finally {
        setIsLoading(false);
      }
    };

    getExchangeRates();
  }, []);

  useEffect(() => {
    setLocalPrice(customPrice || convertedPrice);
    setLocalDiscountRate(discountRate);
  }, [customPrice, convertedPrice, discountRate]);

  const calculateTotalPrice = () => {
    const price = Number(localPrice);
    const discount = Number(localDiscountRate);
    const calculatedTotal = price * (1 + (discount / 100));
    return calculatedTotal;
  };

  const onCurrencyChange = (value: string) => {
    console.log("Currency selection changed to:", value);
    
    // Convert price to new currency
    if (originalCurrency && localPrice) {
      // Only convert if we're changing from the current currency
      if (value !== selectedCurrency) {
        // First convert to TRY (if not already)
        let priceInTRY = Number(localPrice);
        if (selectedCurrency !== "TRY") {
          priceInTRY = priceInTRY * exchangeRates[selectedCurrency];
        }
        
        // Then convert from TRY to target currency
        let newPrice = priceInTRY;
        if (value !== "TRY") {
          newPrice = priceInTRY / exchangeRates[value];
        }
        
        // Update price with converted value
        setLocalPrice(newPrice.toFixed(2));
        setCustomPrice(Number(newPrice.toFixed(2)));
        
        toast.info(`Fiyat ${selectedCurrency}'den ${value}'ye dönüştürüldü (${formatCurrency(Number(localPrice), selectedCurrency)} → ${formatCurrency(newPrice, value)})`);
      }
    }
    
    handleCurrencyChange(value);
  };

  const handlePriceChange = (value: number | string) => {
    setLocalPrice(value);
    setCustomPrice(Number(value));
  };

  const handleDiscountChange = (value: number | string) => {
    const numValue = Number(value);
    setLocalDiscountRate(numValue);
    setDiscountRate(numValue);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
            currencyOptions={currencyOptions}
            isLoading={isLoading}
          />
        </div>

        <div className="col-span-1">
          <PriceInput
            id="unit-price"
            label="Birim Fiyat"
            value={localPrice}
            onChange={handlePriceChange}
          />
        </div>

        <div className="col-span-1">
          <TaxRateSelector
            value={localDiscountRate}
            onChange={handleDiscountChange}
          />
        </div>

        <div className="col-span-1">
          <PriceInput
            id="discount-rate"
            label="İndirim Oranı (%)"
            value={localDiscountRate}
            onChange={handleDiscountChange}
            placeholder="İndirim Oranı"
          />
        </div>
      </div>

      <PriceSummary
        convertedPrice={convertedPrice}
        calculatedTotal={calculateTotalPrice()}
        selectedCurrency={selectedCurrency}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default PriceAndDiscountSection;
