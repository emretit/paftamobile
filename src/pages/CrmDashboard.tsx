
import DefaultLayout from "@/components/layouts/DefaultLayout";
import CrmSummary from "@/components/crm/CrmSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import DashboardChart from "@/components/DashboardChart";
import DashboardBarChart from "@/components/DashboardBarChart";
import DashboardCard from "@/components/DashboardCard";
import { CalendarDays, LineChart, ListTodo, Target, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard = ({ isCollapsed, setIsCollapsed }: CrmDashboardProps) => {
  // Fetch summary data for the stats cards
  const { data: statsData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Get counts from different tables
      const [proposalsResult, tasksResult, dealsResult, contactsResult] = await Promise.all([
        supabase.from("proposals").select("id", { count: "exact" }),
        supabase.from("tasks").select("id", { count: "exact" }),
        supabase.from("deals").select("id", { count: "exact" }),
        supabase.from("customers").select("id", { count: "exact" })
      ]);
      
      return {
        proposals: proposalsResult.count || 0,
        tasks: tasksResult.count || 0, 
        deals: dealsResult.count || 0,
        contacts: contactsResult.count || 0
      };
    }
  });

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="CRM Kontrol Paneli"
      subtitle="Fırsatlar, Teklifler ve Görevlere genel bakış"
    >
      <div className="container mx-auto py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="sales">Satış Metrikleri</TabsTrigger>
            <TabsTrigger value="activities">Aktiviteler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Dashboard stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard 
                title="Aktif Teklifler" 
                value={statsData?.proposals || 0}
                icon={<ListTodo className="h-6 w-6" />}
                trend={{ value: 12, isPositive: true }}
              />
              <DashboardCard 
                title="Açık Görevler" 
                value={statsData?.tasks || 0}
                icon={<CalendarDays className="h-6 w-6" />}
                trend={{ value: 5, isPositive: true }}
              />
              <DashboardCard 
                title="Devam Eden Fırsatlar" 
                value={statsData?.deals || 0}
                icon={<Target className="h-6 w-6" />}
                trend={{ value: 3, isPositive: false }}
              />
              <DashboardCard 
                title="Toplam Müşteriler" 
                value={statsData?.contacts || 0}
                icon={<Users className="h-6 w-6" />}
                trend={{ value: 8, isPositive: true }}
              />
            </div>
            
            {/* CRM Summary component */}
            <CrmSummary />
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardChart />
              <DashboardBarChart />
            </div>
          </TabsContent>
          
          <TabsContent value="sales">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Satış Metrikleri</h2>
              <p className="text-gray-500">
                Bu bölümde detaylı satış performans metriklerinizi görebilirsiniz.
                Yakında daha fazla içerik eklenecek.
              </p>
            </Card>
          </TabsContent>
          
          <TabsContent value="activities">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Son Aktiviteler</h2>
              <p className="text-gray-500">
                Bu bölümde son aktivitelerinizi ve takip etmeniz gereken görevleri görebilirsiniz.
                Yakında daha fazla içerik eklenecek.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default CrmDashboard;
