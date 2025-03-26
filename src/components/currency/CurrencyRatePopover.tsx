
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, BadgeEuro, BadgePoundSterling, ChevronDown, TrendingUp } from "lucide-react";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyRatePopoverProps {
  selectedCurrency: string;
  onCurrencyChange: (value: string) => void;
  triggerClassName?: string;
}

export const CurrencyRatePopover: React.FC<CurrencyRatePopoverProps> = ({
  selectedCurrency,
  onCurrencyChange,
  triggerClassName = ""
}) => {
  const { exchangeRates, loading, formatCurrency } = useExchangeRates();

  // Get currency icon based on currency code
  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "USD":
        return <BadgeDollarSign className="h-4 w-4 mr-2" />;
      case "EUR":
        return <BadgeEuro className="h-4 w-4 mr-2" />;
      case "GBP":
        return <BadgePoundSterling className="h-4 w-4 mr-2" />;
      default:
        return <TrendingUp className="h-4 w-4 mr-2" />;
    }
  };

  // Format currency label
  const getCurrencyLabel = (currency: string) => {
    switch (currency) {
      case "TRY":
        return "Türk Lirası (₺)";
      case "USD":
        return "Amerikan Doları ($)";
      case "EUR":
        return "Euro (€)";
      case "GBP":
        return "İngiliz Sterlini (£)";
      default:
        return currency;
    }
  };

  const getCurrentRate = (currency: string) => {
    const rate = exchangeRates.find(rate => rate.currency_code === currency);
    if (rate && rate.forex_buying) {
      return `1 ${currency} = ${rate.forex_buying.toFixed(4)} TRY`;
    }
    return "";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-1 font-medium ${triggerClassName}`}
        >
          {getCurrencyIcon(selectedCurrency)}
          <span>{selectedCurrency}</span>
          <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="end">
        <div className="bg-muted/50 p-2 text-xs font-medium">
          Para Birimi Seçiniz
        </div>
        <div className="py-1">
          {loading ? (
            <div className="p-2 space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <div>
              {["TRY", "USD", "EUR", "GBP"].map((currency) => (
                <button
                  key={currency}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                    selectedCurrency === currency ? "bg-primary/10 text-primary font-medium" : ""
                  }`}
                  onClick={() => onCurrencyChange(currency)}
                >
                  <div className="flex items-center">
                    {getCurrencyIcon(currency)}
                    <span>{getCurrencyLabel(currency)}</span>
                  </div>
                  {currency !== "TRY" && (
                    <span className="text-xs text-muted-foreground">
                      {getCurrentRate(currency)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
