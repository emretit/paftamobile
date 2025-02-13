
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Clock,
  UserCog,
  GanttChartSquare,
  Wallet,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopBar } from "@/components/employees/TopBar";
import { EmployeeList } from "@/components/employees/EmployeeList";

interface EmployeesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Employees = ({ isCollapsed, setIsCollapsed }: EmployeesProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'ml-[60px]' : 'ml-64'
      }`}>
        <TopBar />
        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList className="bg-white border w-full justify-start h-12 p-0 px-6">
            <TabsTrigger value="employees" className="data-[state=active]:bg-gray-100 h-12 px-4">
              <UserCog className="h-4 w-4 mr-2" />
              Çalışan Yönetimi
            </TabsTrigger>
            <TabsTrigger value="leaves" className="data-[state=active]:bg-gray-100 h-12 px-4">
              <Clock className="h-4 w-4 mr-2" />
              İzin Yönetimi
            </TabsTrigger>
            <TabsTrigger value="salary" className="data-[state=active]:bg-gray-100 h-12 px-4">
              <Wallet className="h-4 w-4 mr-2" />
              Maaş Yönetimi
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-gray-100 h-12 px-4">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performans
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gray-100 h-12 px-4">
              <GanttChartSquare className="h-4 w-4 mr-2" />
              Görev Yönetimi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4 m-0">
            <main className="p-6">
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Toplam Çalışan</CardTitle>
                      <UserCog className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">142</div>
                      <p className="text-xs text-gray-500">+4 bu ay</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">İzindeki Çalışanlar</CardTitle>
                      <Clock className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-gray-500">3 yıllık izin, 5 rapor</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ortalama Kıdem</CardTitle>
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3.2 yıl</div>
                      <p className="text-xs text-gray-500">+0.3 geçen yıla göre</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Açık Pozisyonlar</CardTitle>
                      <GanttChartSquare className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">6</div>
                      <p className="text-xs text-gray-500">2 aktif mülakat süreci</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <EmployeeList />
            </main>
          </TabsContent>

          <TabsContent value="leaves" className="m-0">
            <div className="p-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500">İzin yönetimi yakında eklenecek.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="salary" className="m-0">
            <div className="p-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500">Maaş yönetimi yakında eklenecek.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="m-0">
            <div className="p-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500">Performans yönetimi yakında eklenecek.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="m-0">
            <div className="p-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-500">Görev yönetimi yakında eklenecek.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Employees;
