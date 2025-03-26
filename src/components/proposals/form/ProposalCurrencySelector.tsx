
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, AlertCircle, ArrowRightLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrencyOptions } from "./items/utils/currencyUtils";
import { CurrencyRatePopover } from "@/components/currency/CurrencyRatePopover";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Badge } from "@/components/ui/badge";

interface ProposalCurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

const ProposalCurrencySelector: React.FC<ProposalCurrencySelectorProps> = ({ 
  selectedCurrency, 
  onCurrencyChange 
}) => {
  const currencyOptions = getCurrencyOptions();
  // Use the dashboard exchange rates to show the TRY equivalent
  const { exchangeRates, formatCurrency } = useExchangeRates();

  // Get the exchange rate for the selected currency
  const getExchangeRateInfo = () => {
    if (selectedCurrency === "TRY") {
      return null; // No need to show conversion for TRY
    }
    
    // Find the currency in the exchange rates
    const rate = exchangeRates.find(rate => rate.currency_code === selectedCurrency);
    
    if (rate && rate.forex_selling) {
      return {
        rate: rate.forex_selling,
        formattedRate: formatCurrency(rate.forex_selling, "TRY")
      };
    }
    
    return null;
  };

  const exchangeRateInfo = getExchangeRateInfo();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <span className="text-base font-medium">
              Teklif Para Birimi:
            </span>
          </div>
          
          <CurrencyRatePopover
            selectedCurrency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
            triggerClassName="w-[130px]"
          />
          
          {exchangeRateInfo && (
            <div className="flex items-center gap-2 ml-2">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="font-normal">
                1 {selectedCurrency} = {exchangeRateInfo.formattedRate}
              </Badge>
            </div>
          )}
          
          <Alert variant="default" className="bg-muted/50 border-muted-foreground/20 ml-auto hidden sm:flex max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seçilen para birimi, tüm teklif kalemlerinin dönüştürüleceği ana para birimidir.
            </AlertDescription>
          </Alert>
        </div>
        
        <Alert variant="default" className="bg-muted/50 border-muted-foreground/20 mt-4 sm:hidden">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Seçilen para birimi, tüm teklif kalemlerinin dönüştürüleceği ana para birimidir.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ProposalCurrencySelector;
