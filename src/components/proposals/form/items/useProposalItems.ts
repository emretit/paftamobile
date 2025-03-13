
import { useState } from "react";
import { useCurrencyManagement } from "./hooks/useCurrencyManagement";
import { useProposalItemsManagement } from "./hooks/useProposalItemsManagement";
import { convertCurrency } from "./utils/currencyUtils";

export const useProposalItems = () => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  
  const {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    formatCurrency,
    handleCurrencyChange
  } = useCurrencyManagement();

  const {
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange
  } = useProposalItemsManagement(selectedCurrency, exchangeRates);

  return {
    selectedCurrency,
    setSelectedCurrency,
    productDialogOpen,
    setProductDialogOpen,
    exchangeRates,
    formatCurrency,
    handleCurrencyChange,
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange,
    convertCurrency
  };
};
