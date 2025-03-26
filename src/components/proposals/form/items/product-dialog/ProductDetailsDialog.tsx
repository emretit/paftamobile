
import React, { useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { useProductDetailsState } from "./hooks/useProductDetailsState";
import ProductInfoSection from "./components/ProductInfoSection";
import PriceAndDiscountSection from "./components/PriceAndDiscountSection";
import QuantityDepoSection from "./components/QuantityDepoSection";
import NotesSection from "./components/NotesSection";
import TotalPriceSection from "./components/TotalPriceSection";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onAddToProposal: (quantity: number, price: number, notes: string) => void;
  selectedCurrency: string;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  open,
  onOpenChange,
  product,
  onAddToProposal,
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
    exchangeRates,
    isLoadingRates,
    calculatedTotal,
    setCalculatedTotal,
    handleCurrencyChange
  } = useProductDetailsState(open, product, selectedCurrency);

  const [quantity, setQuantity] = React.useState(1);
  const [discountRate, setDiscountRate] = React.useState(0);
  const [taxRate, setTaxRate] = React.useState(18); // Default tax rate

  useEffect(() => {
    if (product) {
      setTaxRate(product.tax_rate || 18);
    }
  }, [product]);

  // Reset state when dialog opens with a product
  useEffect(() => {
    if (open && product) {
      setQuantity(1);
      setDiscountRate(0);
      setAvailableStock(product.stock_quantity || 0);
      setStockStatus(
        product.stock_quantity 
          ? product.stock_quantity > (product.stock_threshold || 5) 
            ? 'in_stock' 
            : 'low_stock'
          : 'out_of_stock'
      );
      
      // Set original price and currency
      const productCurrency = product.currency || 'TRY';
      setOriginalCurrency(productCurrency);
      setOriginalPrice(product.price || 0);
      
      // Initialize current currency from selected currency
      setCurrentCurrency(selectedCurrency);
    }
  }, [open, product, selectedCurrency, setAvailableStock, setStockStatus, setOriginalCurrency, setOriginalPrice, setCurrentCurrency]);

  // Format currency with symbol
  const formatCurrency = (amount: number, currency: string = currentCurrency) => {
    const formatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
    
    return formatter.format(amount);
  };

  // Handle clicking the Add to Proposal button
  const handleAddToProposal = () => {
    onAddToProposal(quantity, convertedPrice, notes);
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ürün Detayları</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-6">
            <ProductInfoSection 
              product={product} 
              originalCurrency={originalCurrency}
              originalPrice={originalPrice}
              formatCurrency={formatCurrency}
            />
            
            <PriceAndDiscountSection 
              customPrice={undefined}
              setCustomPrice={setConvertedPrice}
              discountRate={discountRate}
              setDiscountRate={setDiscountRate}
              selectedCurrency={currentCurrency}
              handleCurrencyChange={handleCurrencyChange}
              convertedPrice={convertedPrice}
              originalCurrency={originalCurrency}
              formatCurrency={formatCurrency}
            />
          </div>
          
          <div className="space-y-6">
            <QuantityDepoSection 
              quantity={quantity}
              setQuantity={setQuantity}
              availableStock={availableStock}
              stockStatus={stockStatus}
            />
            
            <TotalPriceSection 
              unitPrice={convertedPrice}
              quantity={quantity}
              discountRate={discountRate}
              taxRate={taxRate}
              calculatedTotal={calculatedTotal}
              setCalculatedTotal={setCalculatedTotal}
              originalCurrency={originalCurrency}
              currentCurrency={currentCurrency}
              formatCurrency={formatCurrency}
            />
            
            <NotesSection 
              notes={notes} 
              setNotes={setNotes} 
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          
          <Button 
            onClick={handleAddToProposal}
            disabled={quantity < 1 || calculatedTotal <= 0}
          >
            Teklife Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
