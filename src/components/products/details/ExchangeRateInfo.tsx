
import React from "react";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { getCurrentExchangeRates, formatExchangeRate } from "@/components/proposals/form/items/utils/currencyUtils";

interface ExchangeRateInfoProps {
  currency: string;
}

const ExchangeRateInfo: React.FC<ExchangeRateInfoProps> = ({ currency }) => {
  const rates = getCurrentExchangeRates();

  // Don't show for TRY as it's the base currency
  if (currency === "TRY") {
    return null;
  }

  return (
    <div className="flex items-center mt-1 text-sm">
      <RefreshCw className="h-3 w-3 mr-1 text-muted-foreground" />
      <Badge variant="outline" className="font-normal bg-blue-50 text-blue-700 border-blue-200">
        {formatExchangeRate(currency, "TRY", rates[currency])}
      </Badge>
    </div>
  );
};

export default ExchangeRateInfo;
