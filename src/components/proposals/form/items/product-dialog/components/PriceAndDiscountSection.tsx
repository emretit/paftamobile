
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrencyOptions } from "../../utils/currencyUtils";
import { Label } from "@/components/ui/label";

interface PriceAndDiscountSectionProps {
  customPrice: number | undefined;
  setCustomPrice: (value: number | undefined) => void;
  discountRate: number;
  setDiscountRate: (value: number) => void;
  selectedCurrency: string;
  handleCurrencyChange: (value: string) => void;
  convertedPrice: number;
  originalCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const PriceAndDiscountSection: React.FC<PriceAndDiscountSectionProps> = ({
  customPrice,
  setCustomPrice,
  discountRate,
  setDiscountRate,
  selectedCurrency,
  handleCurrencyChange,
  convertedPrice,
  originalCurrency,
  formatCurrency
}) => {
  const currencyOptions = getCurrencyOptions();
  const [localPrice, setLocalPrice] = useState<number | string>(customPrice || convertedPrice);
  const [localDiscountRate, setLocalDiscountRate] = useState(discountRate);

  useEffect(() => {
    setLocalPrice(customPrice || convertedPrice);
    setLocalDiscountRate(discountRate);
  }, [customPrice, convertedPrice, discountRate]);

  const calculateTotalPrice = () => {
    const price = Number(localPrice);
    const discount = Number(localDiscountRate);
    const calculatedTotal = price * (1 + (discount / 100));
    return calculatedTotal;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1 space-y-2">
          <Label htmlFor="currency-select" className="font-medium">Para Birimi</Label>
          <Select 
            value={selectedCurrency} 
            onValueChange={(value) => {
              console.log("Currency changed to:", value);
              handleCurrencyChange(value);
            }}
          >
            <SelectTrigger id="currency-select" className="w-full">
              <SelectValue placeholder="Para Birimi" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.symbol} {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 space-y-2">
          <Label htmlFor="unit-price" className="font-medium">Birim Fiyat</Label>
          <Input
            id="unit-price"
            type="number"
            value={localPrice}
            onChange={(e) => {
              const value = e.target.value;
              setLocalPrice(value);
              setCustomPrice(Number(value));
            }}
            placeholder="Birim Fiyat"
            className="w-full"
          />
        </div>

        <div className="col-span-1 space-y-2">
          <Label htmlFor="vat-rate" className="font-medium">KDV Oranı (%)</Label>
          <Select 
            value={`${localDiscountRate}`}
            onValueChange={(value) => {
              const numValue = Number(value);
              setLocalDiscountRate(numValue);
              setDiscountRate(numValue);
            }}
          >
            <SelectTrigger id="vat-rate" className="w-full">
              <SelectValue placeholder="KDV Oranı" />
            </SelectTrigger>
            <SelectContent>
              {[0, 10, 18, 20].map((rate) => (
                <SelectItem key={rate} value={`${rate}`}>
                  {rate}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 space-y-2">
          <Label htmlFor="discount-rate" className="font-medium">İndirim Oranı (%)</Label>
          <Input
            id="discount-rate"
            type="number"
            value={localDiscountRate}
            onChange={(e) => {
              const value = Number(e.target.value);
              setLocalDiscountRate(value);
              setDiscountRate(value);
            }}
            placeholder="İndirim Oranı"
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-muted/40 rounded-md border">
        <h4 className="text-sm font-medium mb-2">Fiyat Özeti</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Önceki Tekliflerdeki Fiyat:</span>
            <span>{formatCurrency(convertedPrice, selectedCurrency)}</span>
          </div>
          <div className="flex justify-between font-medium pt-1 border-t mt-1">
            <span>Toplam Fiyat (KDV Dahil):</span>
            <span>{formatCurrency(calculateTotalPrice(), selectedCurrency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceAndDiscountSection;
