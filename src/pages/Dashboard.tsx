
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import SimpleDashboardCards from "@/components/dashboard/SimpleDashboardCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import ExchangeRateCard from "@/components/dashboard/ExchangeRateCard";
import CashflowOverview from "@/components/cashflow/CashflowOverview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Finansal Kontrol Paneli
              </h1>
              <p className="text-muted-foreground mt-2">
                İşletmenizin finansal durumunu tek bakışta görün
              </p>
            </div>
          </div>

          {/* Main Dashboard Cards */}
          <SimpleDashboardCards />

          {/* Secondary Section: Quick Actions & Exchange Rates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
            <div className="lg:col-span-2">
              <ExchangeRateCard />
            </div>
          </div>

          {/* Cashflow Overview */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Nakit Akış Genel Bakışı</CardTitle>
              <CardDescription>
                Aylık gelir ve gider trendleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CashflowOverview />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
