
import React from "react";
import CurrencyDropdown from "@/components/shared/CurrencyDropdown";
import { CurrencyOption } from "@/components/proposals/form/items/types/currencyTypes";

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (value: string) => void;
  currencyOptions: CurrencyOption[];
  isLoading: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  currencyOptions,
  isLoading
}) => {
  return (
    <CurrencyDropdown
      value={selectedCurrency}
      onValueChange={onCurrencyChange}
      currencyOptions={currencyOptions}
      label="Para Birimi"
      isLoading={isLoading}
    />
  );
};

export default CurrencySelector;
