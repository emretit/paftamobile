
import { useState, useCallback } from "react";
import { useCurrencyManagement } from "./hooks/useCurrencyManagement";
import { ProposalItem } from "@/types/proposal";
import { Product } from "@/types/product";
import { convertCurrency } from "./utils/currencyUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toastUtils";
import { v4 as uuidv4 } from "uuid";

export const useProposalItems = () => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [items, setItems] = useState<ProposalItem[]>([]);
  
  const {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    currencyOptions,
    formatCurrency,
    getCurrencySymbol,
    handleCurrencyChange
  } = useCurrencyManagement();

  // Fetch products for realtime data with optimized query
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, product_categories(*)")
          .eq("is_active", true)  // Only select active products
          .order("name");
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching products:", error);
        showError("Ürünler yüklenirken bir hata oluştu");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Handle adding a new item
  const handleAddItem = useCallback(() => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      currency: selectedCurrency,
    };
    
    setItems(prev => [...prev, newItem]);
    return [...items, newItem];
  }, [selectedCurrency, items]);

  // Handle selecting a product
  const handleSelectProduct = useCallback((product: Product) => {
    // Skip if product is already in the list
    if (items.some((item) => item.product_id === product.id)) {
      return items;
    }

    const productCurrency = product.currency || "TRY";
    let unitPrice = product.price || 0;

    // Convert product price to selected currency if different
    if (productCurrency !== selectedCurrency) {
      unitPrice = convertCurrency(
        unitPrice,
        productCurrency,
        selectedCurrency,
        exchangeRates
      );
    }

    const newItem: ProposalItem = {
      id: uuidv4(),
      product_id: product.id,
      name: product.name,
      description: product.description,
      quantity: 1,
      unit_price: unitPrice,
      tax_rate: product.tax_rate || 18,
      discount_rate: 0, // Default discount rate
      total_price: unitPrice, // Quantity is 1, so total = unit price
      currency: selectedCurrency,
      original_currency: productCurrency,
      original_price: product.price || 0,
      stock_status: product.stock_quantity && product.stock_quantity > 0 
        ? (product.stock_quantity > product.stock_threshold ? 'in_stock' : 'low_stock')
        : 'out_of_stock',
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    return updatedItems;
  }, [items, selectedCurrency, exchangeRates]);

  // Handle removing an item
  const handleRemoveItem = useCallback((id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    return updatedItems;
  }, [items]);

  // Handle item changes
  const handleItemChange = useCallback((id: string, field: keyof ProposalItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id !== id) return item;

      const updatedItem = { ...item, [field]: value };

      // Recalculate total price when quantity or unit_price changes
      if (field === "quantity" || field === "unit_price") {
        updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
      }

      return updatedItem;
    });
    
    setItems(updatedItems);
    return updatedItems;
  }, [items]);

  // Update all items' currency
  const updateAllItemsCurrency = useCallback((newCurrency: string) => {
    if (newCurrency === selectedCurrency) return items;

    const updatedItems = items.map((item) => {
      // If original currency is available, convert from it to maintain accuracy
      const sourceCurrency = item.original_currency || item.currency || selectedCurrency;
      const sourcePrice = 
        sourceCurrency === item.original_currency && item.original_price !== undefined
          ? item.original_price
          : item.unit_price;

      const convertedPrice = convertCurrency(
        sourcePrice,
        sourceCurrency,
        newCurrency,
        exchangeRates
      );

      return {
        ...item,
        unit_price: convertedPrice,
        total_price: convertedPrice * item.quantity,
        currency: newCurrency,
      };
    });

    setItems(updatedItems);
    return updatedItems;
  }, [items, selectedCurrency, exchangeRates]);

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
    updateAllItemsCurrency,
    convertCurrency,
    products,
    isLoading
  };
};
