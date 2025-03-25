
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="price" className="flex items-center justify-between">
          <span>Birim Fiyat</span>
          <Select 
            value={selectedCurrency} 
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger className="h-7 w-24" id="currency-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRY">₺ TRY</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="EUR">€ EUR</SelectItem>
              <SelectItem value="GBP">£ GBP</SelectItem>
            </SelectContent>
          </Select>
        </Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={customPrice !== undefined ? customPrice : convertedPrice}
          onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
        />
        {originalCurrency !== selectedCurrency && (
          <p className="text-xs text-muted-foreground mt-1">
            Dönüştürülmüş: {formatCurrency(convertedPrice, selectedCurrency)}
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
  );
};

export default PriceAndDiscountSection;
