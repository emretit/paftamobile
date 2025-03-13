
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types/product";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ProductDetailsFormProps {
  selectedProduct: Product;
  quantity: number;
  setQuantity: (quantity: number) => void;
  customPrice: number | undefined;
  setCustomPrice: (price: number) => void;
  selectedDepo: string;
  setSelectedDepo: (depo: string) => void;
  discountRate: number;
  setDiscountRate: (rate: number) => void;
  formatCurrency: (amount: number, currency?: string) => string;
}

const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
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
}) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrice(Number(e.target.value));
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountRate(Number(e.target.value));
  };

  // Calculate pricing when dependencies change
  useEffect(() => {
    const basePrice = customPrice !== undefined ? customPrice : selectedProduct.price;
    const discountAmount = basePrice * (discountRate / 100);
    const discountedPrice = basePrice - discountAmount;
    setCalculatedPrice(discountedPrice);
    setTotal(discountedPrice * quantity);
  }, [quantity, customPrice, discountRate, selectedProduct.price]);

  return (
    <div className="py-4">
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Detaylar</TabsTrigger>
          <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="depo">Depo</Label>
            <Select value={selectedDepo} onValueChange={setSelectedDepo}>
              <SelectTrigger id="depo">
                <SelectValue placeholder="Depo seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ana Depo">Ana Depo</SelectItem>
                <SelectItem value="Yedek Depo">Yedek Depo</SelectItem>
                <SelectItem value="Servis Deposu">Servis Deposu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Miktar</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="col-span-1"
            />
          </div>

          <div className="space-y-2">
            <Label>Stok Miktarı</Label>
            <div className="text-sm font-medium">
              {selectedProduct.stock_quantity} {selectedProduct.unit}
            </div>
          </div>

          {selectedProduct.purchase_price && (
            <div className="space-y-2">
              <Label>Alış Fiyatı</Label>
              <div className="text-sm font-medium">
                {formatCurrency(selectedProduct.purchase_price, selectedProduct.currency)}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="price">Satış Fiyatı</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={customPrice !== undefined ? customPrice : selectedProduct.price}
              onChange={handlePriceChange}
              className="col-span-1"
            />
            <div className="text-xs text-muted-foreground">
              Katalog fiyatı: {formatCurrency(selectedProduct.price, selectedProduct.currency)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">İndirim (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              value={discountRate}
              onChange={handleDiscountChange}
              className="col-span-1"
            />
          </div>

          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span>Birim Fiyat:</span>
              <span className="font-medium">
                {formatCurrency(calculatedPrice, selectedProduct.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>KDV Oranı:</span>
              <span className="font-medium">%{selectedProduct.tax_rate}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Toplam:</span>
              <span>
                {formatCurrency(total, selectedProduct.currency)}
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetailsForm;
