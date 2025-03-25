
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { convertCurrency, getCurrentExchangeRates } from "../utils/currencyUtils";

// Import refactored components
import ProductInfoSection from "./components/ProductInfoSection";
import OriginalCurrencyInfo from "./components/OriginalCurrencyInfo";
import QuantityDepoSection from "./components/QuantityDepoSection";
import PriceAndDiscountSection from "./components/PriceAndDiscountSection";
import NotesSection from "./components/NotesSection";
import TotalPriceSection from "./components/TotalPriceSection";

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
  const [totalPrice, setTotalPrice] = useState(0);
  const [availableStock, setAvailableStock] = useState(0);
  const [stockStatus, setStockStatus] = useState("");
  const [convertedPrice, setConvertedPrice] = useState(0);
  const [notes, setNotes] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [originalCurrency, setOriginalCurrency] = useState("");

  // Update calculations when inputs change
  useEffect(() => {
    if (selectedProduct) {
      // Store original product price and currency for reference
      setOriginalPrice(selectedProduct.price);
      setOriginalCurrency(selectedProduct.currency || "TRY");
      
      // Apply discount and calculate total
      const currentPrice = customPrice !== undefined ? customPrice : convertedPrice;
      const discountedPrice = currentPrice * (1 - discountRate / 100);
      const total = quantity * discountedPrice * (1 + (selectedProduct.tax_rate || 0) / 100);
      setTotalPrice(total);
      
      // Set stock info
      setAvailableStock(selectedProduct.stock_quantity || 0);
      
      if (selectedProduct.stock_quantity <= 0) {
        setStockStatus("out_of_stock");
      } else if (selectedProduct.stock_quantity <= (selectedProduct.stock_threshold || 0)) {
        setStockStatus("low_stock");
      } else {
        setStockStatus("in_stock");
      }
    }
  }, [selectedProduct, quantity, customPrice, discountRate, convertedPrice]);

  // Update converted price when currency changes or when dialog opens
  useEffect(() => {
    if (selectedProduct) {
      const productCurrency = selectedProduct.currency || "TRY";
      const productPrice = selectedProduct.price;
      
      if (productCurrency !== selectedCurrency) {
        // Get current exchange rates
        const exchangeRates = getCurrentExchangeRates();
        
        const newConvertedPrice = convertCurrency(
          productPrice,
          productCurrency,
          selectedCurrency,
          exchangeRates
        );
        
        setConvertedPrice(newConvertedPrice);
        
        // Update custom price only if it hasn't been manually changed or when dialog first opens
        if (customPrice === undefined || customPrice === originalPrice) {
          setCustomPrice(newConvertedPrice);
        }
      } else {
        setConvertedPrice(productPrice);
        
        // Update custom price only if it hasn't been manually changed or when dialog first opens
        if (customPrice === undefined || customPrice === originalPrice) {
          setCustomPrice(productPrice);
        }
      }
    }
  }, [selectedCurrency, selectedProduct, customPrice, originalPrice]);

  // Set initial values when dialog opens
  useEffect(() => {
    if (open && selectedProduct) {
      setOriginalPrice(selectedProduct.price);
      setOriginalCurrency(selectedProduct.currency || "TRY");
      // Set initial price based on product currency (will be converted if needed in the other useEffect)
      setCustomPrice(selectedProduct.price);
    }
  }, [open, selectedProduct]);

  if (!selectedProduct) {
    return null;
  }

  // Function to handle currency selection change
  const handleCurrencyChange = (value: string) => {
    // This will trigger the window event for currency change
    window.dispatchEvent(new CustomEvent('currency-change', { detail: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Ürün Detayları</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Product Info */}
          <ProductInfoSection 
            product={selectedProduct}
            stockStatus={stockStatus}
            availableStock={availableStock}
          />
          
          {/* Original Currency Info */}
          <OriginalCurrencyInfo 
            originalCurrency={originalCurrency}
            originalPrice={originalPrice}
            formatCurrency={formatCurrency}
          />
          
          {/* Quantity and Depo */}
          <QuantityDepoSection 
            quantity={quantity}
            setQuantity={setQuantity}
            selectedDepo={selectedDepo}
            setSelectedDepo={setSelectedDepo}
          />
          
          {/* Price and Discount */}
          <PriceAndDiscountSection 
            customPrice={customPrice}
            setCustomPrice={setCustomPrice}
            discountRate={discountRate}
            setDiscountRate={setDiscountRate}
            selectedCurrency={selectedCurrency}
            handleCurrencyChange={handleCurrencyChange}
            convertedPrice={convertedPrice}
            originalCurrency={originalCurrency}
            formatCurrency={formatCurrency}
          />
          
          {/* Notes */}
          <NotesSection 
            notes={notes}
            setNotes={setNotes}
          />
          
          {/* Total Price */}
          <TotalPriceSection 
            totalPrice={totalPrice}
            discountRate={discountRate}
            taxRate={selectedProduct.tax_rate}
            formatCurrency={formatCurrency}
            selectedCurrency={selectedCurrency}
          />
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button type="button" onClick={onSelectProduct} className="ml-2">
            Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
