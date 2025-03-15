
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Card } from "@/components/ui/card";
import DashboardCard from "@/components/DashboardCard";
import { 
  CalendarDays, 
  Users, 
  Truck, 
  Package, 
  Wallet,
  Wrench,
  FileUp,
  FileDown,
  ShoppingCart,
  Briefcase,
  ListTodo,
  FileText,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardChart from "@/components/DashboardChart";
import DashboardBarChart from "@/components/DashboardBarChart";

interface DashboardProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Dashboard = ({ isCollapsed, setIsCollapsed }: DashboardProps) => {
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
      <div className="container mx-auto py-6 space-y-6">
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
        <h2 className="text-2xl font-bold mb-2">Sistem Modülleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">CRM</h3>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-gray-500 mb-4">Müşteri ilişkileri, teklifler ve fırsatlar</p>
            <Button onClick={() => navigate("/crm")} className="w-full">
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
            
        {/* Summary Stats Row */}
        <h2 className="text-2xl font-bold mb-2">Özet İstatistikler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Görev Durumu</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Bekleyen Görevler</span>
                <span className="font-semibold">{Math.floor(Math.random() * 20)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Devam Eden Görevler</span>
                <span className="font-semibold">{Math.floor(Math.random() * 15)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tamamlanan Görevler</span>
                <span className="font-semibold">{Math.floor(Math.random() * 30)}</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/tasks")} className="mt-4 w-full">
              Görevlere Git
            </Button>
          </Card>
          
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Tedarikçi Özeti</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Aktif Tedarikçiler</span>
                <span className="font-semibold">{additionalStats?.suppliers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Bekleyen Siparişler</span>
                <span className="font-semibold">{Math.floor(Math.random() * 12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Son Teslimatlar</span>
                <span className="font-semibold">{Math.floor(Math.random() * 8)}</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/suppliers")} className="mt-4 w-full">
              Tedarikçilere Git
            </Button>
          </Card>
          
          <Card className="p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Fatura Özeti</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Bekleyen Alış Faturaları</span>
                <span className="font-semibold">{Math.floor(Math.random() * 10)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Bekleyen Satış Faturaları</span>
                <span className="font-semibold">{Math.floor(Math.random() * 15)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Son 7 Gün Ciro</span>
                <span className="font-semibold">{Math.floor(Math.random() * 50000)} ₺</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/finance")} className="mt-4 w-full">
              Finansa Git
            </Button>
          </Card>
        </div>
        
        {/* Charts */}
        <h2 className="text-2xl font-bold mb-2">Finansal Grafikler</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardChart />
          <DashboardBarChart />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
