
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ProposalItem } from "@/types/proposal";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toastUtils";
import { v4 as uuidv4 } from "uuid";

export const useProposalItems = () => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");

  // Currency options for select inputs
  const currencyOptions = [
    { value: "TRY", label: "₺ TRY", symbol: "₺" }
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    return "₺";
  };

  // Handle currency change (no-op since we only support TRY)
  const handleCurrencyChange = () => {
    // Do nothing - only TRY is supported
  };

  // Fetch products for realtime data with optimized query
  const { data: products = [], isLoading } = useQuery({
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
      currency: "TRY",
    };
    
    setItems(prev => [...prev, newItem]);
    return [...items, newItem];
  }, [items]);

  // Handle selecting a product
  const handleSelectProduct = useCallback((product: Product) => {
    // Skip if product is already in the list
    if (items.some((item) => item.product_id === product.id)) {
      return items;
    }

    const newItem: ProposalItem = {
      id: uuidv4(),
      product_id: product.id,
      name: product.name,
      description: product.description,
      quantity: 1,
      unit_price: product.price || 0,
      tax_rate: product.tax_rate || 18,
      discount_rate: 0, // Default discount rate
      total_price: product.price || 0, // Quantity is 1, so total = unit price
      currency: "TRY",
      stock_status: product.stock_quantity && product.stock_quantity > 0 
        ? (product.stock_quantity > product.stock_threshold ? 'in_stock' : 'low_stock')
        : 'out_of_stock',
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    return updatedItems;
  }, [items]);

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
      if (field === "quantity" || field === "unit_price" || field === "discount_rate" || field === "tax_rate") {
        const quantity = Number(updatedItem.quantity);
        const unitPrice = Number(updatedItem.unit_price);
        const discountRate = Number(updatedItem.discount_rate || 0);
        const taxRate = Number(updatedItem.tax_rate || 0);
        
        // Apply discount
        const discountedPrice = unitPrice * (1 - discountRate / 100);
        // Calculate total with tax
        updatedItem.total_price = quantity * discountedPrice * (1 + taxRate / 100);
      }

      return updatedItem;
    });
    
    setItems(updatedItems);
    return updatedItems;
  }, [items]);

  // Update all items' currency (no-op since we only support TRY)
  const updateAllItemsCurrency = useCallback(() => {
    // Do nothing since we only support TRY
    return items;
  }, [items]);

  // Convert amount between currencies (no-op since we only support TRY)
  const convertCurrency = (amount: number) => {
    return amount;
  };

  return {
    selectedCurrency,
    setSelectedCurrency,
    productDialogOpen,
    setProductDialogOpen,
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
    isLoading,
    items,
    setItems
  };
};
