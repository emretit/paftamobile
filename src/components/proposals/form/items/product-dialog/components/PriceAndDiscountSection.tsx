import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrencyOptions } from "../../utils/currencyUtils";

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
    <div className="grid grid-cols-4 gap-2 items-center">
      <div className="col-span-1">
        <Select 
          value={selectedCurrency} 
          onValueChange={(value) => {
            handleCurrencyChange(value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Para Birimi" />
          </SelectTrigger>
          <SelectContent>
            {currencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1">
        <Input
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

      <div className="col-span-1">
        <Select 
          value={`${localDiscountRate}`}
          onValueChange={(value) => {
            const numValue = Number(value);
            setLocalDiscountRate(numValue);
            setDiscountRate(numValue);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="KDV(%)" />
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

      <div className="col-span-1">
        <Input
          type="number"
          value={localDiscountRate}
          onChange={(e) => {
            const value = Number(e.target.value);
            setLocalDiscountRate(value);
            setDiscountRate(value);
          }}
          placeholder="İndirim(%)"
          className="w-full"
        />
      </div>

      <div className="col-span-4 mt-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Önceki Fiyat:</span>
          <span>{formatCurrency(convertedPrice, selectedCurrency)}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Toplam:</span>
          <span>{formatCurrency(calculateTotalPrice(), selectedCurrency)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceAndDiscountSection;
