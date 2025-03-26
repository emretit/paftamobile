import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrencyOptions } from "../../../utils/currencyUtils";
import { ArrowRightLeft } from "lucide-react";

interface PriceSummaryProps {
  convertedPrice: number;
  calculatedTotal: number;
  selectedCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
  quantity?: number;
  discountRate?: number;
  taxRate?: number;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
  convertedPrice,
  calculatedTotal,
  selectedCurrency,
  formatCurrency,
  quantity = 1,
  discountRate = 0,
  taxRate = 0
}) => {
  const [displayCurrency, setDisplayCurrency] = useState<string>(selectedCurrency);
  const [convertedDisplayPrice, setConvertedDisplayPrice] = useState<number>(convertedPrice);
  const [convertedDisplayTotal, setConvertedDisplayTotal] = useState<number>(calculatedTotal);
  const currencyOptions = getCurrencyOptions();
  
  useEffect(() => {
    if (displayCurrency === selectedCurrency) {
      setConvertedDisplayPrice(convertedPrice);
      setConvertedDisplayTotal(calculatedTotal);
    } else {
      const conversionRates: Record<string, number> = {
        TRY: 1,
        USD: 0.03,
        EUR: 0.028,
        GBP: 0.024
      };
      
      const fromRate = conversionRates[selectedCurrency] || 1;
      const toRate = conversionRates[displayCurrency] || 1;
      const rate = toRate / fromRate;
      
      setConvertedDisplayPrice(convertedPrice * rate);
      setConvertedDisplayTotal(calculatedTotal * rate);
    }
  }, [displayCurrency, selectedCurrency, convertedPrice, calculatedTotal]);

  const subtotal = convertedDisplayPrice * quantity;
  
  const discountAmount = subtotal * (discountRate / 100);
  
  const afterDiscount = subtotal - discountAmount;
  
  const taxAmount = afterDiscount * (taxRate / 100);

  return (
    <div className="mt-4 p-3 bg-muted/40 rounded-md border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Fiyat Özeti</h4>
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue placeholder="Para birimi" />
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
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Birim Fiyat:</span>
          <div className="flex flex-col items-end">
            <span>{formatCurrency(convertedDisplayPrice, displayCurrency)}</span>
            {displayCurrency !== selectedCurrency && (
              <span className="text-xs text-muted-foreground">
                ({formatCurrency(convertedPrice, selectedCurrency)})
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Miktar:</span>
          <span>{quantity} adet</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ara Toplam:</span>
          <span>{formatCurrency(subtotal, displayCurrency)}</span>
        </div>
        
        {discountRate > 0 && (
          <div className="flex justify-between text-red-500">
            <span>İndirim ({discountRate}%):</span>
            <span>-{formatCurrency(discountAmount, displayCurrency)}</span>
          </div>
        )}
        
        {discountRate > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">İndirimli Tutar:</span>
            <span>{formatCurrency(afterDiscount, displayCurrency)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">KDV ({taxRate}%):</span>
          <span>{formatCurrency(taxAmount, displayCurrency)}</span>
        </div>
        
        <div className="flex justify-between font-medium pt-1 border-t mt-1">
          <span>Toplam:</span>
          <div className="flex flex-col items-end">
            <span>{formatCurrency(convertedDisplayTotal, displayCurrency)}</span>
            {displayCurrency !== selectedCurrency && (
              <span className="text-xs text-muted-foreground">
                ({formatCurrency(calculatedTotal, selectedCurrency)})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
