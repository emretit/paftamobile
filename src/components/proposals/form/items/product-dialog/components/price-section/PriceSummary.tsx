
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useExchangeRates } from "@/hooks/useExchangeRates";

interface PriceSummaryProps {
  unitPrice: number;
  quantity: number;
  discountRate: number;
  taxRate: number;
  calculatedTotal: number;
  originalCurrency: string;
  currentCurrency: string;
  formatCurrency: (value: number, currency?: string) => string;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
  unitPrice,
  quantity,
  discountRate,
  taxRate,
  calculatedTotal,
  originalCurrency,
  currentCurrency,
  formatCurrency
}) => {
  // Get exchange rates from the global hook
  const { exchangeRates, loading, convertCurrency } = useExchangeRates();
  const [basePriceTotal, setBasePriceTotal] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  
  useEffect(() => {
    // Calculate totals
    const baseTotal = quantity * unitPrice;
    const discount = baseTotal * (discountRate / 100);
    const discountedTotal = baseTotal - discount;
    const tax = discountedTotal * (taxRate / 100);
    
    setBasePriceTotal(baseTotal);
    setDiscountAmount(discount);
    setTaxAmount(tax);
  }, [unitPrice, quantity, discountRate, taxRate]);
  
  // Get rate between currencies for display
  const getExchangeRate = () => {
    if (originalCurrency === currentCurrency) return null;
    
    if (loading) {
      return <Badge variant="outline" className="animate-pulse">Yükleniyor...</Badge>;
    }
    
    // Use the global exchange rate converter
    const rate = convertCurrency(1, originalCurrency, currentCurrency);
    return (
      <>
        <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
          1 {originalCurrency} = {rate.toFixed(4)} {currentCurrency}
        </Badge>
      </>
    );
  };

  return (
    <div className="mt-4 p-3 bg-muted/40 rounded-md border">
      <h3 className="font-medium text-sm mb-2">Fiyat Özeti</h3>
      
      {/* Exchange rate info */}
      {originalCurrency !== currentCurrency && (
        <div className="flex items-center text-xs mb-3">
          {getExchangeRate()}
        </div>
      )}
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <Label>Birim Fiyat:</Label>
          <span>{formatCurrency(unitPrice)}</span>
        </div>
        
        <div className="flex justify-between">
          <Label>Miktar:</Label>
          <span>x {quantity}</span>
        </div>
        
        <div className="flex justify-between">
          <Label>Ara Toplam:</Label>
          <span>{formatCurrency(basePriceTotal)}</span>
        </div>
        
        {discountRate > 0 && (
          <div className="flex justify-between text-red-500">
            <Label>İndirim ({discountRate}%):</Label>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <Label>Vergi (%{taxRate}):</Label>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        
        <div className="flex justify-between font-medium pt-2 border-t dark:border-gray-700">
          <Label>Toplam:</Label>
          <span>{formatCurrency(calculatedTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
