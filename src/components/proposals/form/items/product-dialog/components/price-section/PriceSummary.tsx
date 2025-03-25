
import React from "react";

interface PriceSummaryProps {
  convertedPrice: number;
  calculatedTotal: number;
  selectedCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
  convertedPrice,
  calculatedTotal,
  selectedCurrency,
  formatCurrency
}) => {
  return (
    <div className="mt-4 p-3 bg-muted/40 rounded-md border">
      <h4 className="text-sm font-medium mb-2">Fiyat Özeti</h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Önceki Tekliflerdeki Fiyat:</span>
          <span>{formatCurrency(convertedPrice, selectedCurrency)}</span>
        </div>
        <div className="flex justify-between font-medium pt-1 border-t mt-1">
          <span>Toplam Fiyat (KDV Dahil):</span>
          <span>{formatCurrency(calculatedTotal, selectedCurrency)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
