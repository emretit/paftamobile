
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useExchangeRateData from './hooks/useExchangeRateData';
import ExchangeRateHeader from './ExchangeRates/ExchangeRateHeader';
import ExchangeRateError from './ExchangeRates/ExchangeRateError';
import ExchangeRateLoading from './ExchangeRates/ExchangeRateLoading';
import MainCurrencyCard from './ExchangeRates/MainCurrencyCard';

export const ExchangeRatesPanel: React.FC = () => {
  const {
    rates,
    isLoading,
    error,
    lastUpdated,
    isRefreshing,
    lastUpdateStatus,
    handleRefresh
  } = useExchangeRateData();
  
  console.log('Exchange Rates Panel - Current rates:', rates);
  console.log('Exchange Rates Panel - Loading:', isLoading, 'Error:', error);
  
  const mainCurrencies = ['USD', 'EUR', 'GBP'];
  
  const mainRates = rates.filter(rate => mainCurrencies.includes(rate.currency_code))
    .sort((a, b) => mainCurrencies.indexOf(a.currency_code) - mainCurrencies.indexOf(b.currency_code));
  
  console.log('Main currency rates:', mainRates);

  return (
    <Card className="shadow-md border-gray-200 bg-white dark:bg-gray-900 max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <ExchangeRateHeader 
          lastUpdateStatus={lastUpdateStatus}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      </CardHeader>
      <CardContent>
        {error ? (
          <ExchangeRateError error={error} />
        ) : isLoading ? (
          <ExchangeRateLoading />
        ) : (
          <div className="space-y-4">
            {/* Main currencies display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mainRates.length > 0 ? (
                mainRates.map((rate) => (
                  <MainCurrencyCard key={rate.currency_code} rate={rate} />
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-gray-500 dark:text-gray-400">
                  Ana döviz kurları bulunamadı
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeRatesPanel;
