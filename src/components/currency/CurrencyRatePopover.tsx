
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BadgeDollarSign, BadgeEuro, BadgePoundSterling, BadgeJapaneseYen, ChevronDown, TrendingUp, AlertCircle } from "lucide-react";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { exchangeRates, loading, error } = useExchangeRates();

  // Get currency icon based on currency code
  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "USD":
        return <BadgeDollarSign className="h-4 w-4 mr-2" />;
      case "EUR":
        return <BadgeEuro className="h-4 w-4 mr-2" />;
      case "GBP":
        return <BadgePoundSterling className="h-4 w-4 mr-2" />;
      case "JPY":
        return <BadgeJapaneseYen className="h-4 w-4 mr-2" />;
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

  // Format exchange rate for display
  const formatExchangeRate = (rate: number | null): string => {
    if (rate === null) return '-';
    return rate.toFixed(4);
  };

  // Get exchange rate information
  const getExchangeRateInfo = (currency: string) => {
    if (currency === "TRY") return null;
    
    const rate = exchangeRates.find(r => r.currency_code === currency);
    if (!rate) return null;
    
    return {
      buying: formatExchangeRate(rate.forex_buying),
      selling: formatExchangeRate(rate.forex_selling),
      forexBuying: rate.forex_buying,
      forexSelling: rate.forex_selling
    };
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
      <PopoverContent className="w-[280px] p-0" align="end">
        <div className="bg-muted/50 p-2 text-xs font-medium">
          Para Birimi Seçiniz
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-2 mb-1 mx-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Döviz kurları yüklenemedi
            </AlertDescription>
          </Alert>
        )}
        
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
              {["TRY", "USD", "EUR", "GBP"].map((currency) => {
                const rateInfo = getExchangeRateInfo(currency);
                
                return (
                  <button
                    key={currency}
                    className={`w-full flex flex-col px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                      selectedCurrency === currency ? "bg-primary/10 text-primary font-medium" : ""
                    }`}
                    onClick={() => onCurrencyChange(currency)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {getCurrencyIcon(currency)}
                        <span>{getCurrencyLabel(currency)}</span>
                      </div>
                    </div>
                    
                    {rateInfo && (
                      <div className="ml-6 mt-1 text-xs grid grid-cols-2 gap-x-2 text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Alış:</span>
                          <span className="font-medium">{rateInfo.buying}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Satış:</span>
                          <span className="font-medium">{rateInfo.selling}</span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
