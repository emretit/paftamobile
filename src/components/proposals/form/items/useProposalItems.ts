
import { useState } from "react";
import { ProposalItem } from "@/types/proposal-form";
import { Product } from "@/types/product";
import { v4 as uuidv4 } from "uuid";
import { DEFAULT_EXCHANGE_RATES } from "./proposalItemsConstants";

export const useProposalItems = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");
  const [exchangeRates, setExchangeRates] = useState<{[key: string]: number}>(DEFAULT_EXCHANGE_RATES);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
  };

  const handleAddItem = (items: ProposalItem[], setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>) => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18, // Default tax rate
      totalPrice: 0,
      currency: selectedCurrency
    };
    
    setItems([...items, newItem]);
  };

  const handleSelectProduct = (
    product: Product, 
    items: ProposalItem[], 
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>,
    quantity: number = 1,
    customPrice?: number
  ) => {
    // Use the custom price if provided, otherwise use the product's price
    const price = customPrice !== undefined ? customPrice : (product.price || 0);
    
    // Convert price to the selected currency if needed
    let convertedPrice = price;
    if (product.currency !== selectedCurrency) {
      convertedPrice = convertCurrency(price, product.currency, selectedCurrency);
    }
    
    const newItem: ProposalItem = {
      id: uuidv4(),
      product_id: product.id,
      name: product.name,
      quantity: quantity,
      unitPrice: convertedPrice,
      taxRate: product.tax_rate || 18,
      totalPrice: quantity * convertedPrice,
      currency: selectedCurrency
    };
    
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (
    index: number,
    items: ProposalItem[],
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>
  ) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number, 
    field: keyof ProposalItem, 
    value: string | number,
    items: ProposalItem[],
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>
  ) => {
    const updatedItems = [...items];
    
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      updatedItems[index][field] = Number(value);
      
      // Update total price
      const quantity = updatedItems[index].quantity;
      const unitPrice = updatedItems[index].unitPrice;
      updatedItems[index].totalPrice = quantity * unitPrice;
    } else if (field === 'currency') {
      updatedItems[index].currency = value as string;
    } else {
      // @ts-ignore - We know the field exists
      updatedItems[index][field] = value;
    }
    
    setItems(updatedItems);
  };

  // Convert between currencies if needed
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    
    // Convert from source currency to TRY first (base currency)
    const amountInTRY = amount / exchangeRates[fromCurrency];
    
    // Then convert from TRY to target currency
    return amountInTRY * exchangeRates[toCurrency];
  };

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

