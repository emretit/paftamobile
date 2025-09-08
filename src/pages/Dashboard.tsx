
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

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Finansal
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Satış & CRM
            </TabsTrigger>
            <TabsTrigger value="hr" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              İnsan Kaynakları
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Operasyonlar
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Aktiviteler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ExecutiveSummary />
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <SalesCRMSection />
          </TabsContent>

          <TabsContent value="hr" className="space-y-6">
            <HRAnalytics />
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <OperationsOverview />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed />
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
