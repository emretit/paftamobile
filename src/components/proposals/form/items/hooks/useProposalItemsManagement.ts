
import { Product } from "@/types/product";
import { ProposalItem } from "@/types/proposal-form";
import { v4 as uuidv4 } from "uuid";
import { convertCurrency } from "../utils/currencyUtils";

export const useProposalItemsManagement = (selectedCurrency: string, exchangeRates: {[key: string]: number}) => {
  const handleAddItem = (
    items: ProposalItem[], 
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>
  ) => {
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
      convertedPrice = convertCurrency(price, product.currency, selectedCurrency, exchangeRates);
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

  return {
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange
  };
};
