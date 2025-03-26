
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, AlertCircle, ArrowRightLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrencyOptions } from "./items/utils/currencyUtils";
import { CurrencyRatePopover } from "@/components/currency/CurrencyRatePopover";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ProposalItem } from "@/types/proposal";

interface ProposalCurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  items?: ProposalItem[];
  onItemsChange?: (items: ProposalItem[]) => void;
}

const ProposalCurrencySelector: React.FC<ProposalCurrencySelectorProps> = ({ 
  selectedCurrency, 
  onCurrencyChange,
  items = [],
  onItemsChange
}) => {
  const currencyOptions = getCurrencyOptions();
  // Use the dashboard exchange rates to show the TRY equivalent
  const { exchangeRates, formatCurrency, refreshExchangeRates, convertCurrency } = useExchangeRates();

  // Bileşen yüklendiğinde döviz kurlarını yenileme
  useEffect(() => {
    console.log("ProposalCurrencySelector loaded, refreshing rates");
    refreshExchangeRates();
  }, [refreshExchangeRates]);

  // Listen for global currency change events from other components
  useEffect(() => {
    const handleGlobalCurrencyChangeEvent = (event: CustomEvent<{currency: string, source: string}>) => {
      // If the event wasn't triggered by this component, update our state
      if (event.detail.source !== 'proposal-currency-selector' && event.detail.currency !== selectedCurrency) {
        console.log(`ProposalCurrencySelector received currency change event: ${event.detail.currency} from ${event.detail.source}`);
        onCurrencyChange(event.detail.currency);
      }
    };

    window.addEventListener('global-currency-change', handleGlobalCurrencyChangeEvent as EventListener);
    
    return () => {
      window.removeEventListener('global-currency-change', handleGlobalCurrencyChangeEvent as EventListener);
    };
  }, [selectedCurrency, onCurrencyChange]);

  // Get the exchange rate for the selected currency from the dashboard rates
  const getExchangeRateInfo = () => {
    if (selectedCurrency === "TRY") {
      return null; // No need to show conversion for TRY
    }
    
    // Find the currency in the exchange rates
    const rate = exchangeRates.find(rate => rate.currency_code === selectedCurrency);
    
    if (rate && rate.forex_selling) {
      console.log(`Found rate for ${selectedCurrency}:`, rate.forex_selling);
      return {
        rate: rate.forex_selling,
        formattedRate: formatCurrency(rate.forex_selling, "TRY")
      };
    }
    
    console.log(`No rate found for ${selectedCurrency} in:`, exchangeRates);
    return null;
  };

  // Para birimi değişikliğini ele alma ve tüm ürünlerin fiyatlarını otomatik dönüştürme
  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency === selectedCurrency) return;
    
    // Önce para birimini değiştir
    onCurrencyChange(newCurrency);
    
    // Eğer ürün listesi ve onItemsChange callback'i varsa, ürünlerin para birimlerini dönüştür
    if (items.length > 0 && onItemsChange) {
      console.log(`Converting all items from ${selectedCurrency} to ${newCurrency}`);
      
      const updatedItems = items.map(item => {
        // Eğer ürünün orijinal para birimi saklanmışsa, dönüşümü oradan yap
        const sourceCurrency = item.original_currency || item.currency || selectedCurrency;
        const sourcePrice = 
          sourceCurrency === item.original_currency && item.original_price !== undefined
            ? item.original_price
            : item.unit_price;
            
        console.log(`Converting item ${item.name} from ${sourceCurrency} to ${newCurrency}`);
        console.log(`Original price: ${sourcePrice} ${sourceCurrency}`);

        // Para birimi dönüşümünü yap
        const convertedPrice = convertCurrency(sourcePrice, sourceCurrency, newCurrency);
        console.log(`Converted price: ${convertedPrice} ${newCurrency}`);
        
        // Vergi ve indirim oranlarını hesaba katarak toplam fiyatı güncelle
        const quantity = Number(item.quantity || 1);
        const discountRate = Number(item.discount_rate || 0);
        const taxRate = Number(item.tax_rate || 0);
        
        // Apply discount
        const discountedPrice = convertedPrice * (1 - discountRate / 100);
        // Calculate total with tax
        const totalPrice = quantity * discountedPrice * (1 + taxRate / 100);

        return {
          ...item,
          unit_price: convertedPrice,
          total_price: totalPrice,
          currency: newCurrency
        };
      });
      
      // Güncellenmiş ürün listesini üst bileşene bildir
      onItemsChange(updatedItems);
      toast.success(`Tüm kalemler ${newCurrency} para birimine dönüştürüldü`);
    }
    
    // Dispatch a custom event to notify other components
    const event = new CustomEvent('global-currency-change', { 
      detail: { 
        currency: newCurrency,
        source: 'proposal-currency-selector' 
      } 
    });
    window.dispatchEvent(event);
  };

  // Get the exchange rate info once and cache it to avoid constant recalculation
  const exchangeRateInfo = React.useMemo(() => getExchangeRateInfo(), [selectedCurrency, exchangeRates]);
  
  // Debug için kurları ve seçili para birimini konsola yazma
  console.log("Selected currency:", selectedCurrency);
  console.log("Exchange rates:", exchangeRates);
  console.log("Exchange rate info:", exchangeRateInfo);

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
            onCurrencyChange={handleCurrencyChange}
            triggerClassName="w-[130px]"
          />
          
          {exchangeRateInfo ? (
            <div className="flex items-center gap-2 ml-2">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="font-normal">
                1 {selectedCurrency} = {exchangeRateInfo.formattedRate}
              </Badge>
            </div>
          ) : selectedCurrency !== "TRY" && (
            <div className="flex items-center gap-2 ml-2">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="font-normal text-muted-foreground">
                Kur bilgisi yükleniyor...
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
