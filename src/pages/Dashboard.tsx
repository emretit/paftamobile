
import React from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ChartWrapper from "@/components/ui/chart-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ExchangeRateCard from "@/components/dashboard/ExchangeRateCard";
import DashboardCard from "@/components/DashboardCard";
import { Users, CheckSquare, DollarSign, CreditCard, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  const cardData = [
    {
      title: "Toplam Müşteri",
      value: "124",
      icon: <Users className="h-6 w-6 text-primary" />,
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      title: "Açık Task",
      value: "87",
      icon: <CheckSquare className="h-6 w-6 text-primary" />,
      trend: {
        value: 5,
        isPositive: false
      }
    },
    {
      title: "Bekleyen Ödeme",
      value: "₺14.500",
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      trend: {
        value: 22,
        isPositive: true
      }
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
            <DashboardCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              trend={card.trend}
            />
          ))}
        </div>

        {/* Exchange Rates Card - Featured prominently at the top */}
        <div className="mt-8">
          <ExchangeRateCard />
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
