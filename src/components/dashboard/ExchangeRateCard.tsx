
import React from "react";
import { RefreshCw, AlertCircle, DollarSign, Euro, PoundSterling, CircleDollarSign, Coins } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useExchangeRates, ExchangeRate } from "@/hooks/useExchangeRates";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const CurrencyIcon = ({ code }: { code: string }) => {
  switch (code) {
    case 'USD':
      return <DollarSign className="h-4 w-4" />;
    case 'EUR':
      return <Euro className="h-4 w-4" />;
    case 'GBP':
      return <PoundSterling className="h-4 w-4" />;
    case 'JPY':
      return <CircleDollarSign className="h-4 w-4" />; 
    case 'CHF':
      return <Coins className="h-4 w-4" />; 
    default:
      return null;
  }
};

const ExchangeRateCard: React.FC = () => {
  const { exchangeRates, loading, error, lastUpdate, refreshExchangeRates } = useExchangeRates();

  // Format number with 4 decimal places
  const formatRate = (rate: number | null) => {
    if (rate === null) return '-';
    return rate.toFixed(4);
  };

  const formatLastUpdate = (dateString: string | null) => {
    if (!dateString) return 'Bilinmiyor';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="border border-border shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
        <div>
          <CardTitle className="text-xl font-bold text-primary">Döviz Kurları</CardTitle>
          <CardDescription>
            {lastUpdate 
              ? `Son güncelleme: ${formatLastUpdate(lastUpdate)}`
              : 'Güncelleme bilgisi alınamadı'}
          </CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={refreshExchangeRates}
                disabled={loading}
                className="hover:bg-primary hover:text-white transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Döviz kurlarını güncelle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="pt-4">
        {error ? (
          <div className="flex items-center gap-2 p-4 text-white bg-destructive rounded-md">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Döviz kurları yüklenemedi</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        ) : loading && exchangeRates.length === 0 ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <Skeleton className="h-6 w-10" />
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {loading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <div className="animate-pulse text-primary font-medium">Güncelleniyor...</div>
              </div>
            )}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium">Para Birimi</th>
                  <th className="text-right p-2 font-medium">Forex Alış</th>
                  <th className="text-right p-2 font-medium">Forex Satış</th>
                  <th className="text-right p-2 font-medium">Efektif Alış</th>
                  <th className="text-right p-2 font-medium">Efektif Satış</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRates
                  .filter(rate => rate.currency_code !== 'TRY')
                  .sort((a, b) => {
                    // Order currencies: USD, EUR, GBP, CHF, JPY, others
                    const order = { USD: 1, EUR: 2, GBP: 3, CHF: 4, JPY: 5 };
                    return (order[a.currency_code as keyof typeof order] || 99) - 
                           (order[b.currency_code as keyof typeof order] || 99);
                  })
                  .map((rate: ExchangeRate) => (
                  <tr key={rate.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <CurrencyIcon code={rate.currency_code} />
                        <Badge variant="outline" className="font-medium">
                          {rate.currency_code}
                        </Badge>
                      </div>
                    </td>
                    <td className="text-right p-2 font-mono">{formatRate(rate.forex_buying)}</td>
                    <td className="text-right p-2 font-mono">{formatRate(rate.forex_selling)}</td>
                    <td className="text-right p-2 font-mono">{formatRate(rate.banknote_buying)}</td>
                    <td className="text-right p-2 font-mono">{formatRate(rate.banknote_selling)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeRateCard;
