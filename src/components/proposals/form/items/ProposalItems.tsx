
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Upload, Download } from "lucide-react";
import ProposalItemsTable from "./ProposalItemsTable";
import ProposalItemsHeader from "./ProposalItemsHeader";
import { ProposalItem } from "@/types/proposal";
import { getCurrencyOptions } from "./utils/currencyUtils";
import { ProductSearchDialog } from "./product-dialog/ProductSearchDialog";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Separator } from "@/components/ui/separator";

interface ProposalItemsProps {
  items: ProposalItem[];
  onItemsChange: (items: ProposalItem[]) => void;
  selectedCurrency: string;
}

const TAX_RATE_OPTIONS = [
  { value: 0, label: "0%" },
  { value: 1, label: "1%" },
  { value: 8, label: "8%" },
  { value: 10, label: "10%" },
  { value: 18, label: "18%" },
  { value: 20, label: "20%" },
];

const ProposalItems: React.FC<ProposalItemsProps> = ({
  items,
  onItemsChange,
  selectedCurrency,
}) => {
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const currencyOptions = getCurrencyOptions();
  const { exchangeRates, formatCurrency, convertCurrency } = useExchangeRates();

  // Listen for global currency change events from other components
  useEffect(() => {
    const handleGlobalCurrencyChangeEvent = (event: CustomEvent<{currency: string, source: string}>) => {
      // Skip processing if we triggered the event ourselves
      if (event.detail.source === 'proposal-items') return;
      
      console.log(`ProposalItems received currency change event: ${event.detail.currency} from ${event.detail.source}`);
      
      // Only update items if they have different currencies than the new global currency
      const itemsToUpdate = items.filter(item => 
        (item.currency || selectedCurrency) !== event.detail.currency
      );
      
      if (itemsToUpdate.length > 0) {
        console.log(`Converting ${itemsToUpdate.length} items to ${event.detail.currency}`);
        
        // Create updated items array with converted currencies
        const updatedItems = items.map(item => {
          if ((item.currency || selectedCurrency) === event.detail.currency) {
            return item; // No change needed
          }
          
          const sourceCurrency = item.currency || selectedCurrency;
          const targetCurrency = event.detail.currency;
          
          // Convert unit price to new currency
          const convertedPrice = convertCurrency(
            item.unit_price,
            sourceCurrency,
            targetCurrency
          );
          
          // Calculate new total price with the converted unit price
          const quantity = Number(item.quantity || 1);
          const discountRate = Number((item as any).discount_rate || 0);
          const taxRate = Number(item.tax_rate || 0);
          
          // Apply discount
          const discountedPrice = convertedPrice * (1 - discountRate / 100);
          // Calculate total with tax
          const totalPrice = quantity * discountedPrice * (1 + taxRate / 100);
          
          return {
            ...item,
            currency: targetCurrency,
            unit_price: convertedPrice,
            total_price: totalPrice
          };
        });
        
        // Update the items
        onItemsChange(updatedItems);
      }
    };

    window.addEventListener('global-currency-change', handleGlobalCurrencyChangeEvent as EventListener);
    
    return () => {
      window.removeEventListener('global-currency-change', handleGlobalCurrencyChangeEvent as EventListener);
    };
  }, [items, selectedCurrency, onItemsChange, convertCurrency]);

  const handleAddItem = () => {
    const newItem: ProposalItem = {
      id: crypto.randomUUID(),
      name: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 18,
      total_price: 0,
      currency: selectedCurrency,
    };
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  const handleItemChange = (
    index: number,
    field: keyof ProposalItem | 'currency' | 'discount_rate',
    value: string | number
  ) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };

    // @ts-ignore - We know we're adding dynamic fields
    item[field] = value;

    // Recalculate total price when quantity, unit_price, tax_rate or discount_rate changes
    if (
      field === "quantity" ||
      field === "unit_price" ||
      field === "tax_rate" ||
      field === "discount_rate"
    ) {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const taxRate = Number(item.tax_rate);
      const discountRate = Number((item as any).discount_rate || 0);

      // Apply discount first
      const discountedPrice = unitPrice * (1 - discountRate / 100);
      // Calculate total with tax
      item.total_price = quantity * discountedPrice * (1 + taxRate / 100);
    }

    updatedItems[index] = item;
    onItemsChange(updatedItems);
  };

  // Handle currency change for a specific item
  const handleItemCurrencyChange = (index: number, currency: string) => {
    const item = items[index];
    const currentCurrency = item.currency || selectedCurrency;
    
    // Skip if currency hasn't changed
    if (currentCurrency === currency) return;
    
    // Convert the unit price using exchange rates
    const convertedPrice = convertCurrency(
      item.unit_price,
      currentCurrency,
      currency
    );
    
    // Update both the currency and the unit price
    const updatedItems = [...items];
    const updatedItem = { 
      ...updatedItems[index],
      currency,
      unit_price: convertedPrice 
    };
    
    // Recalculate the total price
    const quantity = Number(updatedItem.quantity);
    const discountRate = Number((updatedItem as any).discount_rate || 0);
    const taxRate = Number(updatedItem.tax_rate || 0);
    
    // Apply discount
    const discountedPrice = convertedPrice * (1 - discountRate / 100);
    // Calculate total with tax
    updatedItem.total_price = quantity * discountedPrice * (1 + taxRate / 100);
    
    updatedItems[index] = updatedItem;
    onItemsChange(updatedItems);
    
    // If this is the only or last remaining item with a different currency,
    // dispatch an event to inform other components of a potential currency change
    const remainingDifferentCurrency = updatedItems.filter(
      item => (item.currency || selectedCurrency) !== currency
    );
    
    if (remainingDifferentCurrency.length === 0) {
      const event = new CustomEvent('global-currency-change', { 
        detail: { 
          currency,
          source: 'proposal-items' 
        } 
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <ProposalItemsHeader />
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddItem}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Yeni Kalem
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddProductDialogOpen(true)}
            className="gap-1"
          >
            <Search className="h-4 w-4" />
            Ürün Ara
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <ProposalItemsTable
          items={items}
          handleItemChange={handleItemChange}
          handleRemoveItem={handleRemoveItem}
          handleItemCurrencyChange={handleItemCurrencyChange}
          selectedCurrency={selectedCurrency}
          formatCurrency={formatCurrency}
          currencyOptions={currencyOptions}
          taxRateOptions={TAX_RATE_OPTIONS}
          exchangeRates={exchangeRates.getRatesMap()}
          convertCurrency={convertCurrency}
        />
      </div>

      <ProductSearchDialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
        onProductSelect={(product) => {
          // Add logic to add selected product to items
          console.log("Selected product:", product);
        }}
        currentCurrency={selectedCurrency}
      />
    </>
  );
};

export default ProposalItems;
