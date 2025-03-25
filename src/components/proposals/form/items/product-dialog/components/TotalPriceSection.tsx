
import React from "react";

interface TotalPriceSectionProps {
  totalPrice: number;
  discountRate: number;
  taxRate: number | undefined;
  formatCurrency: (amount: number, currency?: string) => string;
  selectedCurrency: string;
}

const TotalPriceSection: React.FC<TotalPriceSectionProps> = ({
  totalPrice,
  discountRate,
  taxRate,
  formatCurrency,
  selectedCurrency
}) => {
  return (
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
        <span>KDV: %{taxRate || 0}</span>
      </div>
    </div>
  );
};

export default TotalPriceSection;
