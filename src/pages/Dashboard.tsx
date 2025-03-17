import React from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ChartWrapper from "@/components/ui/chart-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
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
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWrapper
            title="Satışlar"
            data={[
              { name: "Ocak", total: 4000 },
              { name: "Şubat", total: 3000 },
              { name: "Mart", total: 2000 },
              { name: "Nisan", total: 2780 },
              { name: "Mayıs", total: 1890 },
              { name: "Haziran", total: 2390 },
            ]}
            dataKey="total"
          />
          
          <ChartWrapper
            title="Gelir Gider"
            data={[
              { name: "Ocak", total: 4000 },
              { name: "Şubat", total: 3000 },
              { name: "Mart", total: 2000 },
              { name: "Nisan", total: 2780 },
              { name: "Mayıs", total: 1890 },
              { name: "Haziran", total: 2390 },
            ]}
            dataKey="total"
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
