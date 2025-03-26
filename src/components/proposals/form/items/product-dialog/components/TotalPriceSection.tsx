
import React, { useEffect } from "react";
import PriceSummary from "./price-section/PriceSummary";

interface TotalPriceSectionProps {
  unitPrice: number;
  quantity: number;
  discountRate: number;
  taxRate: number;
  calculatedTotal: number;
  setCalculatedTotal: (value: number) => void;
  originalCurrency: string;
  currentCurrency: string;
  formatCurrency: (value: number, currency?: string) => string;
}

const TotalPriceSection: React.FC<TotalPriceSectionProps> = ({
  unitPrice,
  quantity,
  discountRate,
  taxRate,
  calculatedTotal,
  setCalculatedTotal,
  originalCurrency,
  currentCurrency,
  formatCurrency
}) => {
  // Calculate total price with tax and discount
  useEffect(() => {
    // Base total
    const baseTotal = quantity * unitPrice;
    
    // Apply discount
    const discountAmount = baseTotal * (discountRate / 100);
    const discountedTotal = baseTotal - discountAmount;
    
    // Apply tax
    const taxAmount = discountedTotal * (taxRate / 100);
    const finalTotal = discountedTotal + taxAmount;
    
    setCalculatedTotal(finalTotal);
  }, [quantity, unitPrice, discountRate, taxRate, setCalculatedTotal]);

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Fiyat Hesaplama</h3>
      
      <PriceSummary
        unitPrice={unitPrice}
        quantity={quantity}
        discountRate={discountRate}
        taxRate={taxRate}
        calculatedTotal={calculatedTotal}
        originalCurrency={originalCurrency}
        currentCurrency={currentCurrency}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default TotalPriceSection;
