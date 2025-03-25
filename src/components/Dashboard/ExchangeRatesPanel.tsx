
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExchangeRate {
  currency_code: string;
  forex_buying: number | null;
  forex_selling: number | null;
  banknote_buying: number | null;
  banknote_selling: number | null;
  cross_rate: number | null;
  update_date: string;
}

interface UpdateStatus {
  status: string;
  message: string;
}

const formatDate = (dateString: string) => {
  // Handle both date-only and full ISO timestamp formats
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Tarih bilgisi mevcut değil';
  }
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  try {
    return date.toLocaleDateString('tr-TR', options);
  } catch (e) {
    // Fallback formatting if Turkish locale is not available
    return date.toLocaleString();
  }
};

const getCurrencyName = (code: string): string => {
  const names: Record<string, string> = {
    'USD': 'ABD Doları',
    'EUR': 'Euro',
    'GBP': 'İngiliz Sterlini',
    'TRY': 'Türk Lirası',
    'JPY': 'Japon Yeni',
    'CHF': 'İsviçre Frangı',
    'CAD': 'Kanada Doları',
    'AUD': 'Avustralya Doları',
    'RUB': 'Rus Rublesi',
    'CNY': 'Çin Yuanı',
    'SAR': 'Suudi Riyali',
    'NOK': 'Norveç Kronu',
    'DKK': 'Danimarka Kronu',
    'SEK': 'İsveç Kronu'
  };
  return names[code] || code;
};

const getCurrencyIcon = (code: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'TRY': '₺',
    'JPY': '¥',
    'CHF': 'Fr',
    'CAD': 'C$',
    'AUD': 'A$',
    'RUB': '₽',
    'CNY': '¥',
    'SAR': '﷼‎',
    'NOK': 'kr',
    'DKK': 'kr',
    'SEK': 'kr'
  };
  return symbols[code] || code;
};

export const ExchangeRatesPanel: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdateStatus, setLastUpdateStatus] = useState<UpdateStatus | null>(null);
  
  const mainCurrencies = ['USD', 'EUR', 'GBP'];
  
  const fetchLastUpdateStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rate_updates')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching update status:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setLastUpdateStatus({
          status: data[0].status as string,
          message: data[0].message as string
        });
      }
    } catch (err) {
      console.error('Error in fetchLastUpdateStatus:', err);
    }
  };
  
  const fetchExchangeRates = async () => {
    try {
      setIsRefreshing(true);
      
      // Use the Supabase client to fetch exchange rates
      const { data, error: queryError } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('update_date', { ascending: false });
      
      if (queryError) {
        throw new Error(`Veritabanından döviz kurları alınamadı: ${queryError.message}`);
      }
      
      if (!data || data.length === 0) {
        // If no data in the database, try calling the function to get fresh data
        const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-exchange-rates', {
          method: 'GET'
        });
        
        if (functionError) {
          throw new Error(`Döviz kurları çekilemedi: ${functionError.message}`);
        }
        
        if (functionData && functionData.data && functionData.data.length > 0) {
          const formattedRates: ExchangeRate[] = functionData.data.map((rate: any) => ({
            currency_code: rate.currency_code,
            forex_buying: rate.forex_buying,
            forex_selling: rate.forex_selling,
            banknote_buying: null,
            banknote_selling: null,
            cross_rate: null,
            update_date: functionData.update_date || new Date().toISOString()
          }));
          
          setRates(formattedRates);
          setLastUpdated(functionData.update_date || new Date().toISOString());
        } else {
          throw new Error('Döviz kuru verisi bulunamadı');
        }
      } else {
        const formattedRates: ExchangeRate[] = data.map((rate: any) => ({
          currency_code: rate.currency_code,
          forex_buying: rate.forex_buying,
          forex_selling: rate.forex_selling,
          banknote_buying: null,
          banknote_selling: null,
          cross_rate: null,
          update_date: rate.update_date
        }));
        
        setRates(formattedRates);
        const updateDate = formattedRates.length > 0 ? formattedRates[0].update_date : null;
        setLastUpdated(updateDate);
      }
      
      setError(null);
      
      if (isRefreshing) {
        toast.success('Döviz kurları başarıyla güncellendi');
      }
      
      fetchLastUpdateStatus();
    } catch (err: any) {
      console.error('Failed to fetch exchange rates:', err);
      setError(err.message);
      toast.error('Döviz kurları güncellenirken bir hata oluştu');
      
      const fallbackRates: ExchangeRate[] = [
        { 
          currency_code: 'USD', 
          forex_buying: 32.5, 
          forex_selling: 32.8, 
          banknote_buying: null,
          banknote_selling: null,
          cross_rate: null,
          update_date: new Date().toISOString() 
        },
        { 
          currency_code: 'EUR', 
          forex_buying: 35.2, 
          forex_selling: 35.5, 
          banknote_buying: null,
          banknote_selling: null,
          cross_rate: null,
          update_date: new Date().toISOString() 
        },
        { 
          currency_code: 'GBP', 
          forex_buying: 41.3, 
          forex_selling: 41.6, 
          banknote_buying: null,
          banknote_selling: null,
          cross_rate: null,
          update_date: new Date().toISOString() 
        },
        { 
          currency_code: 'TRY', 
          forex_buying: 1, 
          forex_selling: 1, 
          banknote_buying: null,
          banknote_selling: null,
          cross_rate: null,
          update_date: new Date().toISOString() 
        }
      ];
      setRates(fallbackRates);
      setLastUpdated(new Date().toISOString());
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
    
    const intervalId = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('daily-exchange-rate-update', {
        method: 'POST'
      });
      
      if (error) {
        throw new Error(`Döviz kurları güncellenirken hata oluştu: ${error.message}`);
      }
      
      if (data && data.success) {
        toast.success('Döviz kurları başarıyla güncellendi');
        fetchExchangeRates();
      } else {
        throw new Error(data?.message || 'Döviz kurları güncellenirken hata oluştu');
      }
    } catch (err: any) {
      console.error('Failed to refresh exchange rates:', err);
      toast.error('Döviz kurları güncellenirken bir hata oluştu');
      setIsRefreshing(false);
    }
  };

  const mainRates = rates.filter(rate => mainCurrencies.includes(rate.currency_code))
    .sort((a, b) => mainCurrencies.indexOf(a.currency_code) - mainCurrencies.indexOf(b.currency_code));
  
  const otherRates = rates.filter(rate => 
    !mainCurrencies.includes(rate.currency_code) && 
    rate.currency_code !== 'TRY' &&
    rate.forex_buying !== null
  ).sort((a, b) => a.currency_code.localeCompare(b.currency_code));

  return (
    <Card className="shadow-md border-gray-200 bg-white dark:bg-gray-900">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <span>TCMB Döviz Kurları</span>
            {lastUpdateStatus && (
              <Badge 
                variant={lastUpdateStatus.status === 'success' ? 'outline' : 'destructive'}
                className="ml-3 text-xs"
              >
                {lastUpdateStatus.status === 'success' ? 'Güncel' : 'Hata'}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock size={14} className="mr-1" />
                <span>Son Güncelleme: {formatDate(lastUpdated)}</span>
              </div>
            )}
            <button 
              onClick={handleRefresh} 
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={isRefreshing}
              title="Kurları Güncelle"
            >
              <RefreshCw 
                size={18} 
                className={`text-gray-500 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
            <AlertCircle className="mr-2" size={20} />
            <span>{error}</span>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-12 w-28" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Main currencies display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {mainRates.map((rate) => (
                <div 
                  key={rate.currency_code}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex flex-col"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-lg flex items-center">
                      <span className="mr-2 font-bold text-2xl">{getCurrencyIcon(rate.currency_code)}</span>
                      {rate.currency_code}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getCurrencyName(rate.currency_code)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <ArrowDownRight className="mr-1 text-green-500" size={16} />
                      <span className="text-gray-600 dark:text-gray-300">Alış:</span>
                      <span className="ml-1 font-medium">{rate.forex_buying?.toLocaleString('tr-TR')}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <ArrowUpRight className="mr-1 text-red-500" size={16} />
                      <span className="text-gray-600 dark:text-gray-300">Satış:</span>
                      <span className="ml-1 font-medium">{rate.forex_selling?.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Other currencies table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-300">Para Birimi</th>
                    <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-300">Alış</th>
                    <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-300">Satış</th>
                  </tr>
                </thead>
                <tbody>
                  {otherRates.map((rate) => (
                    <tr key={rate.currency_code} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-2">
                        <div className="flex items-center">
                          <span className="mr-2 font-medium">{rate.currency_code}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{getCurrencyName(rate.currency_code)}</span>
                        </div>
                      </td>
                      <td className="text-right py-2">{rate.forex_buying?.toLocaleString('tr-TR')}</td>
                      <td className="text-right py-2">{rate.forex_selling?.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeRatesPanel;
