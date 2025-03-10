
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
  TrendingUp
} from "lucide-react";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import { TopBar } from "@/components/TopBar";
import { EmployeeList } from "@/components/employees/EmployeeList";

interface EmployeesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Employees = ({ isCollapsed, setIsCollapsed }: EmployeesProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'ml-[60px]' : 'ml-64'
      }`}>
        <TopBar />
        <CustomTabs defaultValue="employees" className="space-y-4">
          <CustomTabsList className="w-full justify-start h-12 p-0 px-6 bg-white shadow-sm border-b">
            <CustomTabsTrigger value="employees" className="h-12 px-4">
              <UserCog className="h-4 w-4 mr-2" />
              Çalışan Yönetimi
            </CustomTabsTrigger>
            <CustomTabsTrigger value="leaves" className="h-12 px-4">
              <Clock className="h-4 w-4 mr-2" />
              İzin Yönetimi
            </CustomTabsTrigger>
            <CustomTabsTrigger value="salary" className="h-12 px-4">
              <Wallet className="h-4 w-4 mr-2" />
              Maaş Yönetimi
            </CustomTabsTrigger>
            <CustomTabsTrigger value="performance" className="h-12 px-4">
              <BarChart3 className="h-4 w-4 mr-2" />
              Performans
            </CustomTabsTrigger>
            <CustomTabsTrigger value="tasks" className="h-12 px-4">
              <GanttChartSquare className="h-4 w-4 mr-2" />
              Görev Yönetimi
            </CustomTabsTrigger>
          </CustomTabsList>

          <CustomTabsContent value="employees" className="space-y-4 m-0">
            <main className="p-6">
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Toplam Çalışan</CardTitle>
                      <UserCog className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">142</div>
                      <p className="text-xs text-gray-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        +4 bu ay
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">İzindeki Çalışanlar</CardTitle>
                      <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-gray-500">3 yıllık izin, 5 rapor</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ortalama Kıdem</CardTitle>
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3.2 yıl</div>
                      <p className="text-xs text-gray-500 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                        +0.3 geçen yıla göre
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Açık Pozisyonlar</CardTitle>
                      <GanttChartSquare className="h-4 w-4 text-primary" />
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
          </CustomTabsContent>

          <CustomTabsContent value="leaves" className="m-0">
            <div className="p-6">
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
                  <div className="text-center max-w-md">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">İzin yönetimi yakında</h3>
                    <p className="text-gray-500">Bu modül çalışanların izin taleplerini yönetmenize olanak sağlayacak. Şu anda geliştirme aşamasındadır.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CustomTabsContent>

          <CustomTabsContent value="salary" className="m-0">
            <div className="p-6">
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
                  <div className="text-center max-w-md">
                    <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Maaş yönetimi yakında</h3>
                    <p className="text-gray-500">Bu modül çalışanlarınızın maaş bilgilerini yönetmenize olanak sağlayacak. Şu anda geliştirme aşamasındadır.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CustomTabsContent>

          <CustomTabsContent value="performance" className="m-0">
            <div className="p-6">
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
                  <div className="text-center max-w-md">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Performans yönetimi yakında</h3>
                    <p className="text-gray-500">Bu modül çalışanlarınızın performansını değerlendirmenize olanak sağlayacak. Şu anda geliştirme aşamasındadır.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CustomTabsContent>

          <CustomTabsContent value="tasks" className="m-0">
            <div className="p-6">
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
                  <div className="text-center max-w-md">
                    <GanttChartSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Görev yönetimi yakında</h3>
                    <p className="text-gray-500">Bu modül çalışanlara görev atamanıza ve takip etmenize olanak sağlayacak. Şu anda geliştirme aşamasındadır.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CustomTabsContent>
        </CustomTabs>
      </div>
    </div>
  );
};

export default Employees;
