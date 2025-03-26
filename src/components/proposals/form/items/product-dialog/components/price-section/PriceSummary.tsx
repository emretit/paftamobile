
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyRatePopover } from "@/components/currency/CurrencyRatePopover";

interface PriceSummaryProps {
  unitPrice: number;
  quantity: number;
  discountRate: number;
  taxRate: number;
  calculatedTotal: number;
  originalCurrency: string;
  currentCurrency: string;
  formatCurrency: (amount: number, currency?: string) => string;
  convertedPrice: number;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
  unitPrice,
  quantity,
  discountRate,
  taxRate,
  calculatedTotal,
  originalCurrency,
  currentCurrency,
  formatCurrency,
  convertedPrice
}) => {
  // Calculate values
  const baseTotal = unitPrice * quantity;
  const discountAmount = baseTotal * (discountRate / 100);
  const subtotal = baseTotal - discountAmount;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <Card className="bg-muted/40">
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Birim Fiyat:</span>
            <span className="font-medium">
              {formatCurrency(unitPrice, originalCurrency)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm">Adet:</span>
            <span className="font-medium">{quantity}</span>
          </div>
          
          {discountRate > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span className="text-sm">İndirim ({discountRate}%):</span>
              <span className="font-medium">
                -{formatCurrency(discountAmount, originalCurrency)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-sm">Ara Toplam:</span>
            <span className="font-medium">
              {formatCurrency(subtotal, originalCurrency)}
            </span>
          </div>
          
          <div className="flex justify-between text-muted-foreground">
            <span className="text-sm">KDV ({taxRate}%):</span>
            <span className="font-medium">
              {formatCurrency(taxAmount, originalCurrency)}
            </span>
          </div>
          
          <div className="pt-2 border-t flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-medium">Toplam:</span>
            </div>
            <span className="text-lg font-bold">
              {formatCurrency(total, originalCurrency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceSummary;
