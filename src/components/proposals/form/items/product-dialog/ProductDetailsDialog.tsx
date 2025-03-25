
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

import { Product } from "@/types/product";
import { useProductDetailsState } from "./hooks/useProductDetailsState";
import { useProductCalculations } from "./hooks/useProductCalculations";
import DialogContent as ProductDialogContent from "./components/DialogContent";
import ExchangeRatesNotice from "./components/ExchangeRatesNotice";
import DialogFooterButtons from "./components/DialogFooterButtons";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  quantity: number;
  setQuantity: (value: number) => void;
  customPrice: number | undefined;
  setCustomPrice: (value: number | undefined) => void;
  selectedDepo: string;
  setSelectedDepo: (value: string) => void;
  discountRate: number;
  setDiscountRate: (value: number) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  onSelectProduct: () => void;
  selectedCurrency: string;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedProduct,
  quantity,
  setQuantity,
  customPrice,
  setCustomPrice,
  selectedDepo,
  setSelectedDepo,
  discountRate,
  setDiscountRate,
  formatCurrency,
  onSelectProduct,
  selectedCurrency
}) => {
  const {
    totalPrice,
    setTotalPrice,
    availableStock,
    setAvailableStock,
    stockStatus,
    setStockStatus,
    convertedPrice,
    setConvertedPrice,
    notes,
    setNotes,
    originalPrice,
    setOriginalPrice,
    originalCurrency,
    setOriginalCurrency,
    currentCurrency,
    setCurrentCurrency,
    isLoadingRates,
    calculatedTotal,
    setCalculatedTotal,
    handleCurrencyChange
  } = useProductDetailsState(open, selectedProduct, selectedCurrency);

  useProductCalculations({
    selectedProduct,
    quantity,
    customPrice,
    discountRate,
    setTotalPrice,
    setAvailableStock,
    setStockStatus,
    setCalculatedTotal,
    open,
    setOriginalPrice,
    setOriginalCurrency,
    setCurrentCurrency,
    setCustomPrice,
    setConvertedPrice
  });

  if (!selectedProduct) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Ürün Detayları</DialogTitle>
        </DialogHeader>
        
        <ProductDialogContent
          selectedProduct={selectedProduct}
          stockStatus={stockStatus}
          availableStock={availableStock}
          originalCurrency={originalCurrency}
          originalPrice={originalPrice}
          quantity={quantity}
          setQuantity={setQuantity}
          selectedDepo={selectedDepo}
          setSelectedDepo={setSelectedDepo}
          customPrice={customPrice}
          setCustomPrice={setCustomPrice}
          discountRate={discountRate}
          setDiscountRate={setDiscountRate}
          currentCurrency={currentCurrency}
          handleCurrencyChange={handleCurrencyChange}
          convertedPrice={convertedPrice}
          calculatedTotal={calculatedTotal}
          notes={notes}
          setNotes={setNotes}
          formatCurrency={formatCurrency}
        />
        
        <DialogFooter>
          <ExchangeRatesNotice isLoadingRates={isLoadingRates} />
          <DialogFooterButtons 
            onClose={() => onOpenChange(false)} 
            onSelectProduct={onSelectProduct} 
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
