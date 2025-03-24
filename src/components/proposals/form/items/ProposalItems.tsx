
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { ProposalItem } from "@/types/proposal";
import { Product } from "@/types/product";
import ProposalItemsHeader from "./ProposalItemsHeader";
import ProposalItemsTable from "./ProposalItemsTable";
import ProductSearchDialog from "./product-dialog/ProductSearchDialog";
import { useProposalItems } from "./useProposalItems";

interface ProposalItemsProps {
  items: ProposalItem[];
  onItemsChange: (items: ProposalItem[]) => void;
}

const ProposalItems: React.FC<ProposalItemsProps> = ({ 
  items, 
  onItemsChange 
}) => {
  const {
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
  } = useProposalItems();

  // Currency options
  const currencyOptions = [
    { value: "TRY", label: "TRY (₺)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" }
  ];

  // Tax rate options
  const taxRateOptions = [
    { value: 0, label: "%0" },
    { value: 1, label: "%1" },
    { value: 8, label: "%8" },
    { value: 18, label: "%18" },
    { value: 20, label: "%20" }
  ];

  // Calculate totals
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  };

  return (
    <div className="space-y-4">
      <ProposalItemsHeader
        selectedCurrency={selectedCurrency}
        onCurrencyChange={handleCurrencyChange}
        onAddItem={() => handleAddItem(items, onItemsChange)}
        onOpenProductDialog={() => setProductDialogOpen(true)}
        onSelectProduct={(product) => handleSelectProduct(product, items, onItemsChange)}
        currencyOptions={currencyOptions}
      />
      
      <div className="border dark:border-gray-700 rounded-md overflow-hidden">
        <ProposalItemsTable
          items={items}
          handleItemChange={(index, field, value) => 
            handleItemChange(index, field, value, items, onItemsChange)
          }
          handleRemoveItem={(index) => handleRemoveItem(index, items, onItemsChange)}
          selectedCurrency={selectedCurrency}
          formatCurrency={formatCurrency}
          currencyOptions={currencyOptions}
          taxRateOptions={taxRateOptions}
        />
      </div>

      {items.length > 0 && (
        <div className="flex justify-end">
          <div className="space-y-1 min-w-[200px] p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex justify-between text-sm">
              <span>Ara Toplam:</span>
              <span>{formatCurrency(calculateSubtotal(), selectedCurrency)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Toplam:</span>
              <span>{formatCurrency(calculateSubtotal(), selectedCurrency)}</span>
            </div>
          </div>
        </div>
      )}
      
      <ProductSearchDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSelectProduct={(product, quantity, customPrice) => 
          handleSelectProduct(product, items, onItemsChange, quantity, customPrice)
        }
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
};

export default ProposalItems;
