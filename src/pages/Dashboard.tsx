
import React, { useEffect, useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ChartWrapper from "@/components/ui/chart-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { ExchangeRates } from "@/components/proposals/form/items/types/currencyTypes";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExchangeRates() {
      try {
        // Fetch the latest exchange rates
        const { data: rates, error } = await supabase
          .from('exchange_rates')
          .select('*')
          .order('update_date', { ascending: false })
          .limit(14); // Get the top currencies

        if (error) {
          console.error('Error fetching exchange rates:', error);
          throw error;
        }

        if (rates && rates.length > 0) {
          setExchangeRates(rates);
          setLastUpdate(rates[0].update_date);
        }
      } catch (error) {
        console.error('Error in fetchExchangeRates:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExchangeRates();
  }, []);

  const cardData = [
    {
      title: "Toplam Müşteri",
      value: "124",
      icon: "users",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Açık Task",
      value: "87",
      icon: "tasks",
      change: "-5%",
      changeType: "decrease",
    },
    {
      title: "Bekleyen Ödeme",
      value: "₺14.500",
      icon: "money",
      change: "+22%",
      changeType: "increase",
    },
  ];
  
  const salesData = [
    { name: "Ocak", total: 4000 },
    { name: "Şubat", total: 3000 },
    { name: "Mart", total: 2000 },
    { name: "Nisan", total: 2780 },
    { name: "Mayıs", total: 1890 },
    { name: "Haziran", total: 2390 },
  ];

  const incomeExpenseData = [
    { name: "Ocak", total: 4000 },
    { name: "Şubat", total: 3000 },
    { name: "Mart", total: 2000 },
    { name: "Nisan", total: 2780 },
    { name: "Mayıs", total: 1890 },
    { name: "Haziran", total: 2390 },
  ];

  // Format number with 4 decimal places
  const formatRate = (rate: number | null) => {
    if (rate === null) return '-';
    return rate.toFixed(4);
  };
  
  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Dashboard"
      subtitle="Genel bakış ve özet"
    >
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardData.map((card, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {card.title}
                  <Avatar>
                    <AvatarImage src={`/icons/${card.icon}.svg`} alt={card.title} />
                    <AvatarFallback>{card.title.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">{card.value}</span>
                  <span
                    className={`ml-2 text-sm ${
                      card.changeType === "increase" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {card.change}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          ))}
        </div>

        {/* Exchange Rates */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                TCMB Döviz Kurları
                <span className="text-sm font-normal text-muted-foreground">
                  {lastUpdate ? `Son güncelleme: ${lastUpdate}` : 'Yükleniyor...'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">Döviz kurları yükleniyor...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Para Birimi</th>
                        <th className="text-right p-2">Forex Alış</th>
                        <th className="text-right p-2">Forex Satış</th>
                        <th className="text-right p-2">Efektif Alış</th>
                        <th className="text-right p-2">Efektif Satış</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchangeRates
                        .filter(rate => rate.currency_code !== 'TRY')
                        .map((rate) => (
                        <tr key={rate.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{rate.currency_code}</td>
                          <td className="text-right p-2">{formatRate(rate.forex_buying)}</td>
                          <td className="text-right p-2">{formatRate(rate.forex_selling)}</td>
                          <td className="text-right p-2">{formatRate(rate.banknote_buying)}</td>
                          <td className="text-right p-2">{formatRate(rate.banknote_selling)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWrapper
            title="Satışlar"
            data={salesData}
            dataKey="total"
          />
          
          <ChartWrapper
            title="Gelir Gider"
            data={incomeExpenseData}
            dataKey="total"
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
