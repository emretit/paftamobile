
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/product";
import { Plus, Minus, Tag, Warehouse } from "lucide-react";

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
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  // Calculate total with discount
  const calculateTotal = () => {
    if (!customPrice) return 0;
    const total = quantity * customPrice;
    const discount = total * (discountRate / 100);
    return total - discount;
  };

  // Calculate VAT amount
  const calculateVAT = () => {
    const subtotal = calculateTotal();
    return subtotal * (selectedProduct.tax_rate / 100);
  };

  // Calculate final total with VAT
  const calculateFinalTotal = () => {
    return calculateTotal() + calculateVAT();
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-emerald-800 mb-1 break-all">
          {selectedProduct.name}
        </h2>
        {selectedProduct.description && (
          <p className="text-sm text-emerald-700">{selectedProduct.description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity" className="text-sm font-medium">Miktar</Label>
          <div className="flex items-center mt-1">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={decrementQuantity}
              className="h-8 w-8 rounded-r-none"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input 
              id="quantity" 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
              className="h-8 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={incrementQuantity}
              className="h-8 w-8 rounded-l-none"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="depo" className="text-sm font-medium">Depo</Label>
          <Select 
            value={selectedDepo} 
            onValueChange={setSelectedDepo}
          >
            <SelectTrigger id="depo" className="w-full">
              <SelectValue placeholder="Depo seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ana Depo">Ana Depo (8 Adet)</SelectItem>
              <SelectItem value="Yedek Depo">Yedek Depo (3 Adet)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="text-sm font-medium flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            Birim Fiyat ({selectedProduct.currency})
          </Label>
          <div className="relative mt-1">
            <Input 
              id="price" 
              type="number" 
              min="0" 
              step="0.01" 
              value={customPrice ?? selectedProduct.price} 
              onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)} 
            />
            <div className="absolute right-3 top-3 opacity-70 text-sm">
              {selectedProduct.currency}
            </div>
          </div>
          {selectedProduct.purchase_price && (
            <p className="text-xs text-muted-foreground mt-1">
              Alış: {formatCurrency(selectedProduct.purchase_price, selectedProduct.currency)}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="discount" className="text-sm font-medium">İndirim Oranı (%)</Label>
          <div className="relative mt-1">
            <Input 
              id="discount" 
              type="number" 
              min="0" 
              max="100"
              value={discountRate} 
              onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)} 
            />
            <div className="absolute right-3 top-3 opacity-70 text-sm">
              %
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">Açıklama</Label>
        <textarea 
          id="notes" 
          rows={3} 
          className="w-full mt-1 p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
          placeholder="Ürün hakkında not ekleyin..."
        />
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span>Tutar</span>
          <span>{formatCurrency(calculateTotal(), selectedProduct.currency)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>KDV (%{selectedProduct.tax_rate})</span>
          <span>{formatCurrency(calculateVAT(), selectedProduct.currency)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between items-center font-medium">
          <span>TOPLAM</span>
          <span className="text-lg">{formatCurrency(calculateFinalTotal(), selectedProduct.currency)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsForm;
