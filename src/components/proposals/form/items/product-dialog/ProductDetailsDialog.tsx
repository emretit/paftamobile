
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/product";
import { convertCurrency } from "../utils/currencyUtils";

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

  // Update calculations when inputs change
  useEffect(() => {
    if (selectedProduct) {
      let basePrice = customPrice !== undefined ? customPrice : selectedProduct.price;
      
      // Convert price to selected currency if needed
      if (selectedProduct.currency !== selectedCurrency) {
        const exchangeRates = {
          TRY: 1,
          USD: 32.5,
          EUR: 35.2,
          GBP: 41.3
        };
        basePrice = convertCurrency(
          basePrice, 
          selectedProduct.currency, 
          selectedCurrency, 
          exchangeRates
        );
      }
      
      setConvertedPrice(basePrice);
      
      // Apply discount
      const discountedPrice = basePrice * (1 - discountRate / 100);
      
      // Calculate total with tax
      const total = quantity * discountedPrice * (1 + (selectedProduct.tax_rate || 0) / 100);
      setTotalPrice(total);
      
      // Set stock info
      setAvailableStock(selectedProduct.stock_quantity || 0);
      
      if (selectedProduct.stock_quantity <= 0) {
        setStockStatus("out_of_stock");
      } else if (selectedProduct.stock_quantity <= selectedProduct.min_stock_level) {
        setStockStatus("low_stock");
      } else {
        setStockStatus("in_stock");
      }
    }
  }, [selectedProduct, quantity, customPrice, discountRate, selectedCurrency]);

  if (!selectedProduct) {
    return null;
  }

  const getStockStatusText = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "Stokta Yok";
      case "low_stock":
        return "Düşük Stok";
      case "in_stock":
        return "Stokta";
      default:
        return "Bilinmiyor";
    }
  };

  const getStockStatusClass = (status: string) => {
    switch (status) {
      case "out_of_stock":
        return "text-red-500";
      case "low_stock":
        return "text-yellow-500";
      case "in_stock":
        return "text-green-500";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ürün Detayları</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Product Info */}
          <div>
            <h3 className="text-lg font-medium">{selectedProduct.name}</h3>
            {selectedProduct.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedProduct.description}
              </p>
            )}
            <div className="flex items-center mt-2 text-sm">
              <span className="mr-4">SKU: {selectedProduct.sku || "-"}</span>
              <span className={`${getStockStatusClass(stockStatus)}`}>
                {getStockStatusText(stockStatus)} ({availableStock} adet)
              </span>
            </div>
          </div>
          
          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Miktar</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="depo">Depo</Label>
              <Select value={selectedDepo} onValueChange={setSelectedDepo}>
                <SelectTrigger>
                  <SelectValue placeholder="Depo seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ana Depo">Ana Depo</SelectItem>
                  <SelectItem value="Yedek Depo">Yedek Depo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Price and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Birim Fiyat ({selectedCurrency})</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={customPrice !== undefined ? customPrice : convertedPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
              />
              {selectedProduct.currency !== selectedCurrency && (
                <p className="text-xs text-muted-foreground mt-1">
                  Orijinal: {formatCurrency(selectedProduct.price, selectedProduct.currency)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discount">İndirim Oranı (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discountRate}
                onChange={(e) => setDiscountRate(Math.min(100, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>
          
          {/* Total Price */}
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Toplam:</span>
              <span className="font-bold">{formatCurrency(totalPrice, selectedCurrency)}</span>
            </div>
            {discountRate > 0 && (
              <div className="text-xs text-right text-muted-foreground mt-1">
                <span>İndirim: %{discountRate}</span>
              </div>
            )}
            <div className="text-xs text-right text-muted-foreground">
              <span>KDV: %{selectedProduct.tax_rate || 0}</span>
            </div>
          </div>
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
