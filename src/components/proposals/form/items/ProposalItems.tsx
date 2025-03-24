
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, AlertCircle } from "lucide-react";
import { ProposalItem } from "@/types/proposal";
import { Product } from "@/types/product";
import ProposalItemsHeader from "./ProposalItemsHeader";
import ProposalItemsTable from "./ProposalItemsTable";
import ProductSearchDialog from "./product-dialog/ProductSearchDialog";
import { useProposalItems } from "./useProposalItems";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    currencyOptions,
    handleCurrencyChange,
    handleAddItem,
    handleSelectProduct,
    handleRemoveItem,
    handleItemChange,
    convertCurrency,
    isLoading
  } = useProposalItems();

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

  // Calculate tax total
  const calculateTaxTotal = () => {
    return items.reduce((sum, item) => {
      const unitPrice = item.unit_price || 0;
      const quantity = item.quantity || 0;
      const taxRate = item.tax_rate || 0;
      const discountRate = item.discount_rate || 0;
      
      // Apply discount to unit price
      const discountedUnitPrice = unitPrice * (1 - discountRate / 100);
      
      // Calculate tax amount
      const itemSubtotal = discountedUnitPrice * quantity;
      const taxAmount = itemSubtotal * (taxRate / 100);
      
      return sum + taxAmount;
    }, 0);
  };

  // Calculate discount total
  const calculateDiscountTotal = () => {
    return items.reduce((sum, item) => {
      const unitPrice = item.unit_price || 0;
      const quantity = item.quantity || 0;
      const discountRate = item.discount_rate || 0;
      
      // Calculate discount amount
      const itemFullPrice = unitPrice * quantity;
      const discountAmount = itemFullPrice * (discountRate / 100);
      
      return sum + discountAmount;
    }, 0);
  };

  const handleProductSelect = (product: Product, quantity?: number, customPrice?: number, discountRate?: number) => {
    handleSelectProduct(product, items, onItemsChange, quantity, customPrice, discountRate);
    toast.success(`${product.name} teklif kalemine eklendi`);
  };

  // Check for stock warnings
  const hasLowStockItems = items.some(item => item.stock_status === 'low_stock');
  const hasOutOfStockItems = items.some(item => item.stock_status === 'out_of_stock');

  return (
    <div className="space-y-4">
      <ProposalItemsHeader
        selectedCurrency={selectedCurrency}
        onCurrencyChange={handleCurrencyChange}
        onAddItem={() => handleAddItem(items, onItemsChange)}
        onOpenProductDialog={() => setProductDialogOpen(true)}
        onSelectProduct={(product) => handleProductSelect(product)}
        currencyOptions={currencyOptions}
      />
      
      {/* Stock warnings */}
      {(hasLowStockItems || hasOutOfStockItems) && (
        <Alert variant={hasOutOfStockItems ? "destructive" : "default"} className={!hasOutOfStockItems ? "border-yellow-500 text-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" : ""}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {hasOutOfStockItems ? "Stokta olmayan ürünler" : "Düşük stoklu ürünler"}
          </AlertTitle>
          <AlertDescription>
            {hasOutOfStockItems 
              ? "Teklifinizde stokta olmayan ürünler bulunmaktadır. Lütfen stok durumunu kontrol edin."
              : "Teklifinizde düşük stok seviyesinde ürünler bulunmaktadır. Stok durumunu kontrol etmeniz önerilir."}
          </AlertDescription>
        </Alert>
      )}
      
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
          <div className="space-y-2 min-w-[300px] p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="flex justify-between text-sm">
              <span>Ara Toplam:</span>
              <span>{formatCurrency(calculateSubtotal() - calculateTaxTotal(), selectedCurrency)}</span>
            </div>
            {calculateDiscountTotal() > 0 && (
              <div className="flex justify-between text-sm text-red-500">
                <span>İndirim Tutarı:</span>
                <span>-{formatCurrency(calculateDiscountTotal(), selectedCurrency)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>KDV Toplamı:</span>
              <span>{formatCurrency(calculateTaxTotal(), selectedCurrency)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t dark:border-gray-700">
              <span>Genel Toplam:</span>
              <span>{formatCurrency(calculateSubtotal(), selectedCurrency)}</span>
            </div>
          </div>
        </div>
      )}
      
      <ProductSearchDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSelectProduct={(product, quantity, customPrice, discountRate) => 
          handleProductSelect(product, quantity, customPrice, discountRate)
        }
        selectedCurrency={selectedCurrency}
      />
    </div>
  );
};

export default ProposalItems;
