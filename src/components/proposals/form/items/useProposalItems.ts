
import { useState } from "react";
import { useCurrencyManagement } from "./hooks/useCurrencyManagement";
import { useProposalItemsManagement } from "./hooks/useProposalItemsManagement";
import { convertCurrency } from "./utils/currencyUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProposalItems = () => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  
  const {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    currencyOptions,
    formatCurrency,
    getCurrencySymbol,
    handleCurrencyChange
  } = useCurrencyManagement();

  const {
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange
  } = useProposalItemsManagement(selectedCurrency, exchangeRates);

  // Fetch products for realtime data
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_categories(*)")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    selectedCurrency,
    setSelectedCurrency,
    productDialogOpen,
    setProductDialogOpen,
    exchangeRates,
    currencyOptions,
    formatCurrency,
    getCurrencySymbol,
    handleCurrencyChange,
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange,
    convertCurrency,
    products,
    isLoading
  };
};
