
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrencySymbol } from "../utils/currencyUtils";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  quantity: number;
  setQuantity: (quantity: number) => void;
  customPrice?: number;
  setCustomPrice: (price: number | undefined) => void;
  selectedDepo: string;
  setSelectedDepo: (depo: string) => void;
  discountRate: number;
  setDiscountRate: (rate: number) => void;
  formatCurrency: (amount: number, currency?: string) => string;
  onSelectProduct: () => void;
}

const ProductDetailsDialog = ({
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
  onSelectProduct
}: ProductDetailsDialogProps) => {
  const [availableStores] = useState([
    { id: "Ana Depo", name: "Ana Depo" },
    { id: "Yedek Depo", name: "Yedek Depo" },
    { id: "Servis Depo", name: "Servis Deposu" }
  ]);

  // Initialize customPrice when selectedProduct changes
  useEffect(() => {
    if (selectedProduct && (customPrice === undefined || open)) {
      setCustomPrice(selectedProduct.price);
    }
  }, [selectedProduct, open, customPrice, setCustomPrice]);

  if (!selectedProduct) return null;

  const handleConfirm = () => {
    onSelectProduct();
  };

  const finalPrice = (customPrice || 0) * (1 - discountRate / 100);
  const totalPrice = finalPrice * quantity;
  const currency = selectedProduct.currency || "TRY";
  const symbol = getCurrencySymbol(currency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedProduct.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Depo</label>
              <Select value={selectedDepo} onValueChange={setSelectedDepo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Depo Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Depolar</SelectLabel>
                    {availableStores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Birim Fiyat ({symbol})
              </label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={customPrice || 0}
                onChange={e => setCustomPrice(parseFloat(e.target.value) || 0)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Önerilen: {formatCurrency(selectedProduct.price, currency)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                İndirim Oranı ({discountRate}%)
              </label>
              <Slider
                value={[discountRate]}
                min={0}
                max={100}
                step={1}
                onValueChange={value => setDiscountRate(value[0])}
                className="my-4"
              />
              {discountRate > 0 && (
                <p className="text-xs text-muted-foreground">
                  İndirimli fiyat: {formatCurrency(finalPrice, currency)}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Miktar</label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Stok: {selectedProduct.stock_quantity || 0} {selectedProduct.unit || "adet"}
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium mb-1 block">Ürün Bilgileri</label>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span>{selectedProduct.sku || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barkod:</span>
                  <span>{selectedProduct.barcode || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KDV:</span>
                  <span>%{selectedProduct.tax_rate || 18}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md mt-4">
              <div className="flex justify-between text-sm">
                <span>Toplam:</span>
                <span className="font-medium">
                  {formatCurrency(totalPrice, currency)}
                </span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Toplam İndirim:</span>
                  <span>
                    {formatCurrency((customPrice || 0) * quantity * (discountRate / 100), currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Vazgeç
          </Button>
          <Button 
            type="button" 
            onClick={handleConfirm}
          >
            Ürünü Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;
