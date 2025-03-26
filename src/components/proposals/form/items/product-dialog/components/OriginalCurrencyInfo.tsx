
import React from "react";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol, getCurrencyName } from "../utils/currencyFormatUtils";

interface OriginalCurrencyInfoProps {
  originalCurrency: string;
  originalPrice: number;
  formatCurrency: (amount: number, currency?: string) => string;
}

const OriginalCurrencyInfo: React.FC<OriginalCurrencyInfoProps> = ({
  originalCurrency,
  originalPrice,
  formatCurrency
}) => {
  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
      <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
        <span className="font-medium mr-2">Orijinal Para Birimi:</span>
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:border-blue-700">
          {getCurrencySymbol(originalCurrency)} {getCurrencyName(originalCurrency)}
        </Badge>
        <span className="ml-2">
          Fiyat: {formatCurrency(originalPrice, originalCurrency)}
        </span>
      </div>
    </div>
  );
};

export default OriginalCurrencyInfo;
