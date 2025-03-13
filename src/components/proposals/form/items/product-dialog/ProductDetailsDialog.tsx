
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Product } from "@/types/product";
import ProductDetailsForm from "./ProductDetailsForm";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  quantity: number;
  setQuantity: (quantity: number) => void;
  customPrice: number | undefined;
  setCustomPrice: (price: number) => void;
  selectedDepo: string;
  setSelectedDepo: (depo: string) => void;
  discountRate: number;
  setDiscountRate: (rate: number) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  onSelectProduct: () => void;
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
}) => {
  if (!selectedProduct) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {selectedProduct.name}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <ProductDetailsForm
          selectedProduct={selectedProduct}
          quantity={quantity}
          setQuantity={setQuantity}
          customPrice={customPrice}
          setCustomPrice={setCustomPrice}
          selectedDepo={selectedDepo}
          setSelectedDepo={setSelectedDepo}
          discountRate={discountRate}
          setDiscountRate={setDiscountRate}
          formatCurrency={formatCurrency}
        />
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button 
            onClick={onSelectProduct}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Teklife Ekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
