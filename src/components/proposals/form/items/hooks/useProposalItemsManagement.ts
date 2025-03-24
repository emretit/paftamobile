
import { Product } from "@/types/product";
import { ProposalItem } from "@/types/proposal";
import { v4 as uuidv4 } from "uuid";
import { convertCurrency, calculateTotalWithTax } from "../utils/currencyUtils";

export const useProposalItemsManagement = (selectedCurrency: string, exchangeRates: {[key: string]: number}) => {
  const handleAddItem = (
    items: ProposalItem[], 
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>
  ) => {
    // Create a new proposal item with default values
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 18, // Default tax rate
      total_price: 0,
      discount_rate: 0, // Default discount rate
      currency: selectedCurrency,
      stock_status: 'in_stock',
      group: 'diger' // Default grup değeri
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
      console.log(`Converting price from ${product.currency} (${price}) to ${selectedCurrency} using rates:`, exchangeRates);
      convertedPrice = convertCurrency(price, product.currency, selectedCurrency, exchangeRates);
      console.log(`Converted price: ${convertedPrice} ${selectedCurrency}`);
    }
    
    // Calculate total price with tax
    const totalPrice = calculateTotalWithTax(
      convertedPrice, 
      quantity, 
      product.tax_rate || 18,
      discountRate
    );
    
    // Determine stock status
    let stockStatus = 'in_stock';
    if (product.stock_quantity <= 0) {
      stockStatus = 'out_of_stock';
    } else if (product.stock_quantity <= product.stock_threshold || 
               product.stock_quantity <= product.min_stock_level) {
      stockStatus = 'low_stock';
    }
    
    // Determine product group based on product_type or category_type
    let group = 'diger'; // Default
    if (product.product_type === 'physical') {
      group = 'urun';
    } else if (product.product_type === 'service') {
      group = 'hizmet';
    } else if (product.category_type === 'software') {
      group = 'yazilim';
    } else if (product.category_type === 'hardware') {
      group = 'donanim';
    }
    
    // Create the new proposal item with product data
    const newItem: ProposalItem = {
      id: uuidv4(),
      product_id: product.id,
      name: product.name,
      description: product.description || undefined,
      quantity: quantity,
      unit_price: convertedPrice,
      tax_rate: product.tax_rate || 18,
      discount_rate: discountRate,
      total_price: totalPrice,
      currency: selectedCurrency,
      stock_status: stockStatus,
      group: group,
      // Orijinal fiyat ve para birimi bilgilerini sakla
      original_currency: product.currency,
      original_price: price
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
    field: keyof ProposalItem | 'unitPrice' | 'taxRate' | 'totalPrice', 
    value: string | number,
    items: ProposalItem[],
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>
  ) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    
    if (field === 'quantity' || field === 'unit_price' || field === 'unitPrice' || 
        field === 'tax_rate' || field === 'taxRate' || field === 'discount_rate') {
      // Handle snake_case to camelCase mapping
      if (field === 'unitPrice') {
        item.unit_price = Number(value);
      } else if (field === 'taxRate') {
        item.tax_rate = Number(value);
      } else {
        // @ts-ignore - field exists on ProposalItem
        item[field] = Number(value);
      }
      
      // Update total price
      const quantity = item.quantity;
      const unitPrice = item.unit_price;
      const taxRate = item.tax_rate || 0;
      const discountRate = item.discount_rate || 0;
      
      // Calculate with tax and discount
      item.total_price = calculateTotalWithTax(unitPrice, quantity, taxRate, discountRate);
    } else if (field === 'currency') {
      const oldCurrency = item.currency || selectedCurrency;
      const newCurrency = value as string;
      
      // Convert the unit price to the new currency
      if (oldCurrency !== newCurrency) {
        // Eğer orijinal para birimi ve fiyat bilgisi varsa, direkt ondan dönüştür
        if (item.original_currency && item.original_price !== undefined) {
          item.unit_price = convertCurrency(
            item.original_price,
            item.original_currency,
            newCurrency,
            exchangeRates
          );
        } else {
          // Yoksa mevcut fiyattan dönüştür
          item.unit_price = convertCurrency(
            item.unit_price,
            oldCurrency,
            newCurrency,
            exchangeRates
          );
        }
        
        // Update total price
        const quantity = item.quantity;
        const unitPrice = item.unit_price;
        const taxRate = item.tax_rate || 0;
        const discountRate = item.discount_rate || 0;
        
        // Calculate with tax and discount
        item.total_price = calculateTotalWithTax(unitPrice, quantity, taxRate, discountRate);
      }
      
      item.currency = newCurrency;
    } else {
      // @ts-ignore - We know the field exists
      item[field] = value;
    }
    
    setItems(updatedItems);
  };

  // Tüm kalemlerin para birimini değiştirme fonksiyonu
  const updateAllItemsCurrency = (
    items: ProposalItem[],
    setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>,
    newCurrency: string
  ) => {
    if (!items || items.length === 0) return;

    const updatedItems = items.map(item => {
      const oldCurrency = item.currency || selectedCurrency;
      
      // Para birimi değişmediyse atla
      if (oldCurrency === newCurrency) return item;
      
      // Kopya oluştur
      const updatedItem = { ...item };
      
      // Eğer orijinal para birimi ve fiyat bilgisi varsa, direkt ondan dönüştür
      if (item.original_currency && item.original_price !== undefined) {
        updatedItem.unit_price = convertCurrency(
          item.original_price,
          item.original_currency,
          newCurrency,
          exchangeRates
        );
      } else {
        // Yoksa mevcut fiyattan dönüştür
        updatedItem.unit_price = convertCurrency(
          item.unit_price,
          oldCurrency,
          newCurrency,
          exchangeRates
        );
      }
      
      // Para birimini güncelle
      updatedItem.currency = newCurrency;
      
      // Toplam fiyatı yeniden hesapla
      updatedItem.total_price = calculateTotalWithTax(
        updatedItem.unit_price,
        updatedItem.quantity,
        updatedItem.tax_rate || 0,
        updatedItem.discount_rate || 0
      );
      
      return updatedItem;
    });
    
    setItems(updatedItems);
  };

  return {
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange,
    updateAllItemsCurrency // Tüm kalemleri güncelleme fonksiyonunu dışarı aktar
  };
};
