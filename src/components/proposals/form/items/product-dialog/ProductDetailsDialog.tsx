
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/types/product";
import ProductDetailsForm from "./ProductDetailsForm";

export interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct?: Product | null;
  quantity?: number;
  setQuantity?: (value: number) => void;
  customPrice?: number;
  setCustomPrice?: (value: number) => void;
  selectedDepo?: string;
  setSelectedDepo?: (value: string) => void;
  discountRate?: number;
  setDiscountRate?: (value: number) => void;
  formatCurrency?: (amount: number, currency?: string) => string;
  onSelectProduct: (product: Product, quantity?: number, customPrice?: number, discountRate?: number) => void;
  selectedCurrency?: string;
}

const ProductDetailsDialog: React.FC<ProductDetailsDialogProps> = ({
  open,
  onOpenChange,
  selectedProduct = null,
  quantity = 1,
  setQuantity,
  customPrice,
  setCustomPrice,
  selectedDepo,
  setSelectedDepo,
  discountRate = 0,
  setDiscountRate,
  formatCurrency,
  onSelectProduct,
  selectedCurrency = "TRY"
}) => {
  // Support for simple mode where we don't have external state
  const [internalQuantity, setInternalQuantity] = React.useState(quantity);
  const [internalCustomPrice, setInternalCustomPrice] = React.useState(customPrice);
  const [internalDiscountRate, setInternalDiscountRate] = React.useState(discountRate);
  const [internalDepo, setInternalDepo] = React.useState(selectedDepo || "");

  // Use external handlers if provided, otherwise use internal state
  const handleQuantityChange = setQuantity || setInternalQuantity;
  const handleCustomPriceChange = setCustomPrice || setInternalCustomPrice;
  const handleDiscountRateChange = setDiscountRate || setInternalDiscountRate;
  const handleDepoChange = setSelectedDepo || setInternalDepo;

  // Reset internal state when dialog opens with new product
  React.useEffect(() => {
    if (open) {
      setInternalQuantity(quantity);
      setInternalCustomPrice(selectedProduct?.price || 0);
      setInternalDiscountRate(discountRate);
      setInternalDepo(selectedDepo || "");
    }
  }, [open, selectedProduct, quantity, discountRate]);

  const handleSelectProduct = () => {
    if (selectedProduct) {
      onSelectProduct(
        selectedProduct,
        setQuantity ? quantity : internalQuantity,
        setCustomPrice ? customPrice : internalCustomPrice,
        setDiscountRate ? discountRate : internalDiscountRate
      );
      onOpenChange(false);
    }
  };

  if (!selectedProduct && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürün Detayı</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-muted-foreground">
            Lütfen bir ürün seçin.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ürün Detayları</DialogTitle>
        </DialogHeader>
        
        {selectedProduct && (
          <ProductDetailsForm
            product={selectedProduct}
            quantity={setQuantity ? quantity : internalQuantity}
            setQuantity={handleQuantityChange}
            customPrice={setCustomPrice ? customPrice : internalCustomPrice}
            setCustomPrice={handleCustomPriceChange}
            selectedDepo={setSelectedDepo ? selectedDepo : internalDepo}
            setSelectedDepo={handleDepoChange}
            discountRate={setDiscountRate ? discountRate : internalDiscountRate}
            setDiscountRate={handleDiscountRateChange}
            onSelectProduct={handleSelectProduct}
            formatCurrency={formatCurrency}
            selectedCurrency={selectedCurrency}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
