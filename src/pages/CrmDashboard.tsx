import DefaultLayout from "@/components/layouts/DefaultLayout";
import CrmSummary from "@/components/crm/CrmSummary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import DashboardCard from "@/components/DashboardCard";
import { Target, ListTodo, FileText, Users } from "lucide-react";

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard = ({ isCollapsed, setIsCollapsed }: CrmDashboardProps) => {
  // Fetch summary data for the stats cards
  const { data: statsData } = useQuery({
    queryKey: ["crm-stats"],
    queryFn: async () => {
      // Get counts from CRM-related tables
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
      subtitle="Müşteri İlişkileri Yönetimi Özeti"
    >
      <div className="container mx-auto py-6">
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">CRM Özeti</TabsTrigger>
            <TabsTrigger value="deals">Fırsat Analizi</TabsTrigger>
            <TabsTrigger value="proposals">Teklif Analizi</TabsTrigger>
            <TabsTrigger value="tasks">Görev Takibi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6">
            {/* CRM Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard 
                title="Aktif Müşteriler" 
                value={statsData?.contacts || 0}
                icon={<Users className="h-6 w-6" />}
                trend={{ value: 8, isPositive: true }}
              />
              <DashboardCard 
                title="Açık Fırsatlar" 
                value={statsData?.deals || 0}
                icon={<Target className="h-6 w-6" />}
                trend={{ value: 5, isPositive: true }}
              />
              <DashboardCard 
                title="Aktif Teklifler" 
                value={statsData?.proposals || 0}
                icon={<FileText className="h-6 w-6" />}
                trend={{ value: 3, isPositive: false }}
              />
              <DashboardCard 
                title="Bekleyen Görevler" 
                value={statsData?.tasks || 0}
                icon={<ListTodo className="h-6 w-6" />}
                trend={{ value: 2, isPositive: false }}
              />
            </div>
            
            {/* Main CRM content */}
            <CrmSummary />
          </TabsContent>
          
          <TabsContent value="deals">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Fırsat Analizi</h2>
              <p className="text-gray-500 mb-6">Tüm satış fırsatlarınızın detaylı analizi ve dönüşüm oranları</p>
              
              {/* This would be replaced with your actual deals analytics component */}
              <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Fırsat Analizi Grafiği</p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="proposals">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Teklif Analizi</h2>
              <p className="text-gray-500 mb-6">Tekliflerin durum dağılımı ve kabul oranları</p>
              
              {/* This would be replaced with your actual proposals analytics component */}
              <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Teklif Analizi Grafiği</p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Görev Takibi</h2>
              <p className="text-gray-500 mb-6">CRM görevlerinin durum ve öncelik dağılımı</p>
              
              {/* This would be replaced with your actual tasks analytics component */}
              <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Görev Analizi Grafiği</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default CrmDashboard;
