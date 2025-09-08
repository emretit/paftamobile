
import React, { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import SalesCRMSection from "@/components/dashboard/SalesCRMSection";
import HRAnalytics from "@/components/dashboard/HRAnalytics";
import OperationsOverview from "@/components/dashboard/OperationsOverview";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  Target, 
  Settings,
  Bell,
  RefreshCw,
  Download,
  Calendar,
  TrendingUp
} from "lucide-react";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // Burada veri yenileme işlemi yapılacak
  };

  const quickStats = [
    { title: "Bugün", value: "₺ 45,200", change: "+12%", color: "text-green-600" },
    { title: "Bu Hafta", value: "₺ 324,800", change: "+8%", color: "text-blue-600" },
    { title: "Bu Ay", value: "₺ 2,847,250", change: "+15%", color: "text-purple-600" },
    { title: "Yıllık", value: "₺ 28,450,000", change: "+23%", color: "text-orange-600" }
  ];

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="İşletme Kontrol Paneli"
      subtitle="İşletmenizin tüm operasyonlarını tek bakışta görün ve yönetin"
    >
      <div className="max-w-[1800px] mx-auto space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="grid grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <Card key={index} className="px-4 py-3">
                  <div className="text-sm text-gray-600">{stat.title}</div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className={`text-xs ${stat.color}`}>{stat.change}</div>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Rapor Al
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Ayarlar
            </Button>
          </div>
        </div>

        {/* Dashboard Summary Widgets */}
        <div className="space-y-6">
          {/* Executive Summary Section */}
          <ExecutiveSummary />
          
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Financial Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Finansal Özet
                </h3>
                <Button variant="ghost" size="sm">
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
              <FinancialOverview />
            </Card>

            {/* Sales & CRM Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Satış & CRM
                </h3>
                <Button variant="ghost" size="sm">
                  <Target className="h-4 w-4" />
                </Button>
              </div>
              <SalesCRMSection />
            </Card>

            {/* HR Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  İnsan Kaynakları
                </h3>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
              <HRAnalytics />
            </Card>

            {/* Operations Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-600" />
                  Operasyonlar
                </h3>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <OperationsOverview />
            </Card>

            {/* Activity Feed */}
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  Son Aktiviteler
                </h3>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              <ActivityFeed />
            </Card>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
