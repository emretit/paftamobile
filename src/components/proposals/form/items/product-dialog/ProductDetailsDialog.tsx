
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
import { convertCurrency, getCurrentExchangeRates, fetchTCMBExchangeRates } from "../utils/currencyUtils";

// Import refactored components
import ProductInfoSection from "./components/ProductInfoSection";
import OriginalCurrencyInfo from "./components/OriginalCurrencyInfo";
import QuantityDepoSection from "./components/QuantityDepoSection";
import PriceAndDiscountSection from "./components/PriceAndDiscountSection";
import NotesSection from "./components/NotesSection";
import TotalPriceSection from "./components/TotalPriceSection";
import { toast } from "sonner";

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
  const [currentCurrency, setCurrentCurrency] = useState(selectedCurrency);
  const [exchangeRates, setExchangeRates] = useState({
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    GBP: 41.3
  });
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Fetch exchange rates when dialog opens
  useEffect(() => {
    if (open) {
      const getExchangeRates = async () => {
        setIsLoadingRates(true);
        try {
          const rates = await fetchTCMBExchangeRates();
          setExchangeRates(rates);
          console.log("Dialog Exchange rates loaded:", rates);
        } catch (error) {
          console.error("Error fetching exchange rates in dialog:", error);
        } finally {
          setIsLoadingRates(false);
        }
      };
      
      getExchangeRates();
    }
  }, [open]);

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
      
      if (productCurrency !== currentCurrency) {
        // Convert using fetched exchange rates
        const newConvertedPrice = convertCurrency(
          productPrice,
          productCurrency,
          currentCurrency,
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
  }, [currentCurrency, selectedProduct, customPrice, originalPrice, exchangeRates]);

  // Set initial values when dialog opens
  useEffect(() => {
    if (open && selectedProduct) {
      setOriginalPrice(selectedProduct.price);
      setOriginalCurrency(selectedProduct.currency || "TRY");
      setCurrentCurrency(selectedCurrency);
      // Set initial price based on product currency (will be converted if needed in the other useEffect)
      setCustomPrice(selectedProduct.price);
    }
  }, [open, selectedProduct, selectedCurrency]);

  // Function to handle currency selection change
  const handleCurrencyChange = (value: string) => {
    console.log("Currency changed in dialog to:", value);
    setCurrentCurrency(value);
    // We'll also send this currency change event to the parent component
    window.dispatchEvent(new CustomEvent('currency-change', { detail: value }));
  };

  if (!selectedProduct) {
    return null;
  }

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
            selectedCurrency={currentCurrency}
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
            selectedCurrency={currentCurrency}
          />
        </div>
        
        <DialogFooter>
          {isLoadingRates && (
            <div className="mr-auto text-sm text-muted-foreground flex items-center">
              <span className="animate-pulse mr-2">●</span>
              Güncel kurlar yükleniyor...
            </div>
          )}
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
