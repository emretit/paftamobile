
import { Product } from "@/types/product";
import { ProposalItem } from "@/types/proposal";
import { v4 as uuidv4 } from "uuid";
import { convertCurrency, calculateTotalWithTax } from "../utils/currencyUtils";

export const useProposalItemsManagement = (selectedCurrency: string, exchangeRates: {[key: string]: number}) => {
  const handleAddItem = (
    items: ProposalItem[], 
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>
  ) => {
    const newItem: ProposalItem & { currency?: string } = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 18, // Default tax rate
      total_price: 0,
      currency: selectedCurrency,
      discount_rate: 0
    };
    
    setItems([...items, newItem]);
  };

  const handleSelectProduct = (
    product: Product, 
    items: ProposalItem[], 
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>,
    quantity: number = 1,
    customPrice?: number,
    discountRate: number = 0
  ) => {
    // Use the custom price if provided, otherwise use the product's price
    const price = customPrice !== undefined ? customPrice : (product.price || 0);
    
    // Convert price to the selected currency if needed
    let convertedPrice = price;
    if (product.currency !== selectedCurrency) {
      convertedPrice = convertCurrency(price, product.currency, selectedCurrency, exchangeRates);
    }
    
    // Calculate total price with tax
    const totalPrice = calculateTotalWithTax(
      convertedPrice, 
      quantity, 
      product.tax_rate || 18,
      discountRate
    );
    
    const newItem: ProposalItem & { 
      currency?: string, 
      product_id?: string,
      discount_rate?: number,
      stock_status?: string
    } = {
      id: uuidv4(),
      product_id: product.id,
      name: product.name,
      description: product.description || undefined,
      quantity: quantity,
      unit_price: convertedPrice,
      tax_rate: product.tax_rate || 18,
      total_price: totalPrice,
      currency: selectedCurrency,
      discount_rate: discountRate,
      stock_status: product.stock_quantity > 0 ? (product.stock_quantity <= product.min_stock_level ? 'low_stock' : 'in_stock') : 'out_of_stock'
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
    field: keyof ProposalItem | 'currency' | 'unitPrice' | 'taxRate' | 'totalPrice' | 'discount_rate', 
    value: string | number,
    items: ProposalItem[],
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>
  ) => {
    const updatedItems = [...items];
    const itemWithExtras = updatedItems[index] as ProposalItem & { 
      currency?: string, 
      unitPrice?: number, 
      taxRate?: number, 
      totalPrice?: number,
      discount_rate?: number
    };
    
    if (field === 'quantity' || field === 'unit_price' || field === 'unitPrice' || 
        field === 'tax_rate' || field === 'taxRate' || field === 'discount_rate') {
      // Handle snake_case to camelCase mapping
      if (field === 'unitPrice') {
        itemWithExtras.unit_price = Number(value);
      } else if (field === 'taxRate') {
        itemWithExtras.tax_rate = Number(value);
      } else {
        // @ts-ignore - field exists on ProposalItem
        itemWithExtras[field] = Number(value);
      }
      
      // Update total price
      const quantity = itemWithExtras.quantity;
      const unitPrice = itemWithExtras.unit_price;
      const taxRate = itemWithExtras.tax_rate || 0;
      const discountRate = itemWithExtras.discount_rate || 0;
      
      // Calculate with tax and discount
      itemWithExtras.total_price = calculateTotalWithTax(unitPrice, quantity, taxRate, discountRate);
    } else if (field === 'currency') {
      const oldCurrency = itemWithExtras.currency || selectedCurrency;
      const newCurrency = value as string;
      
      // Convert the unit price to the new currency
      if (oldCurrency !== newCurrency) {
        itemWithExtras.unit_price = convertCurrency(
          itemWithExtras.unit_price,
          oldCurrency,
          newCurrency,
          exchangeRates
        );
        
        // Update total price
        const quantity = itemWithExtras.quantity;
        const unitPrice = itemWithExtras.unit_price;
        const taxRate = itemWithExtras.tax_rate || 0;
        const discountRate = itemWithExtras.discount_rate || 0;
        
        // Calculate with tax and discount
        itemWithExtras.total_price = calculateTotalWithTax(unitPrice, quantity, taxRate, discountRate);
      }
      
      itemWithExtras.currency = newCurrency;
    } else {
      // @ts-ignore - We know the field exists
      itemWithExtras[field] = value;
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
