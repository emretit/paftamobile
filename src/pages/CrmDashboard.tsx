
import DefaultLayout from "@/components/layouts/DefaultLayout";
import CrmSummary from "@/components/crm/CrmSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import DashboardChart from "@/components/DashboardChart";
import DashboardBarChart from "@/components/DashboardBarChart";
import DashboardCard from "@/components/DashboardCard";
import { 
  CalendarDays, 
  LineChart, 
  ListTodo, 
  Target, 
  Users, 
  Truck, 
  Package, 
  Wallet,
  Wrench,
  FileUp,
  FileDown,
  ShoppingCart
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CrmDashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const CrmDashboard = ({ isCollapsed, setIsCollapsed }: CrmDashboardProps) => {
  const navigate = useNavigate();
  
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

  // Fetch additional data for other sections
  const { data: additionalStats } = useQuery({
    queryKey: ["additional-stats"],
    queryFn: async () => {
      const [productsResult, suppliersResult, employeesResult] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("suppliers").select("id", { count: "exact" }),
        supabase.from("employees").select("id", { count: "exact" })
      ]);
      
      return {
        products: productsResult.count || 0,
        suppliers: suppliersResult.count || 0,
        employees: employeesResult.count || 0
      };
    }
  });

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Ana Kontrol Paneli"
      subtitle="Tüm sistem modüllerine genel bakış"
    >
      <div className="container mx-auto py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="crm">CRM Metrikleri</TabsTrigger>
            <TabsTrigger value="operations">Operasyonel Veriler</TabsTrigger>
            <TabsTrigger value="finance">Finans Özeti</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Primary metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard 
                title="Toplam Müşteri" 
                value={statsData?.contacts || 0}
                icon={<Users className="h-6 w-6" />}
                trend={{ value: 12, isPositive: true }}
              />
              <DashboardCard 
                title="Toplam Ürün" 
                value={additionalStats?.products || 0}
                icon={<Package className="h-6 w-6" />}
                trend={{ value: 5, isPositive: true }}
              />
              <DashboardCard 
                title="Açık Fırsatlar" 
                value={statsData?.deals || 0}
                icon={<Target className="h-6 w-6" />}
                trend={{ value: 3, isPositive: false }}
              />
              <DashboardCard 
                title="Çalışanlar" 
                value={additionalStats?.employees || 0}
                icon={<Users className="h-6 w-6" />}
                trend={{ value: 8, isPositive: true }}
              />
            </div>
            
            {/* Quick Access Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">CRM</h3>
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-gray-500 mb-4">Müşteri ilişkileri, teklifler ve fırsatlar</p>
                <Button onClick={() => navigate("/deals")} className="w-full">
                  CRM Yönetimine Git
                </Button>
              </Card>
              
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Ürün Yönetimi</h3>
                  <Package className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-gray-500 mb-4">Ürün kataloğu ve stok yönetimi</p>
                <Button onClick={() => navigate("/products")} className="w-full">
                  Ürünlere Git
                </Button>
              </Card>
              
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">İnsan Kaynakları</h3>
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-gray-500 mb-4">Çalışan yönetimi ve iş takibi</p>
                <Button onClick={() => navigate("/employees")} className="w-full">
                  İK Yönetimine Git
                </Button>
              </Card>
              
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Finans</h3>
                  <Wallet className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-gray-500 mb-4">Finansal veriler ve raporlama</p>
                <Button onClick={() => navigate("/finance")} className="w-full">
                  Finans Yönetimine Git
                </Button>
              </Card>
              
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Satın Alma</h3>
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-gray-500 mb-4">Tedarikçi ve satın alma yönetimi</p>
                <Button onClick={() => navigate("/purchase-management")} className="w-full">
                  Satın Almaya Git
                </Button>
              </Card>
              
              <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Servis</h3>
                  <Wrench className="h-5 w-5 text-cyan-500" />
                </div>
                <p className="text-gray-500 mb-4">Servis ve teknik destek yönetimi</p>
                <Button onClick={() => navigate("/service")} className="w-full">
                  Servis Yönetimine Git
                </Button>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardChart />
              <DashboardBarChart />
            </div>
          </TabsContent>
          
          <TabsContent value="crm">
            <CrmSummary />
          </TabsContent>
          
          <TabsContent value="operations">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Operasyonel Veriler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <DashboardCard 
                  title="Toplam Tedarikçi" 
                  value={additionalStats?.suppliers || 0}
                  icon={<Truck className="h-6 w-6" />}
                />
                <DashboardCard 
                  title="Açık Görevler" 
                  value={statsData?.tasks || 0}
                  icon={<ListTodo className="h-6 w-6" />}
                />
                <DashboardCard 
                  title="Teknik Servis Talepleri" 
                  value="12"
                  icon={<Wrench className="h-6 w-6" />}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={() => navigate("/suppliers")} 
                  className="flex-1"
                >
                  Tedarikçilere Git
                </Button>
                <Button 
                  onClick={() => navigate("/tasks")} 
                  className="flex-1"
                >
                  Görevlere Git
                </Button>
                <Button 
                  onClick={() => navigate("/service")} 
                  className="flex-1"
                >
                  Servis Yönetimine Git
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="finance">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Finans Özeti</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <DashboardCard 
                  title="Satış Faturaları" 
                  value="24"
                  icon={<FileUp className="h-6 w-6" />}
                />
                <DashboardCard 
                  title="Alım Faturaları" 
                  value="18"
                  icon={<FileDown className="h-6 w-6" />}
                />
                <DashboardCard 
                  title="Açık Teklifler" 
                  value={statsData?.proposals || 0}
                  icon={<LineChart className="h-6 w-6" />}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={() => navigate("/sales-invoices")} 
                  className="flex-1"
                >
                  Satış Faturalarına Git
                </Button>
                <Button 
                  onClick={() => navigate("/purchase-invoices")} 
                  className="flex-1"
                >
                  Alım Faturalarına Git
                </Button>
                <Button 
                  onClick={() => navigate("/finance")} 
                  className="flex-1"
                >
                  Finans Yönetimine Git
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default CrmDashboard;
