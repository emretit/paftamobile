
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
  Search,
  PlusCircle,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface EmployeesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const EmployeeManagementMenu = () => {
  const menuItems = [
    { icon: UserCog, label: "Çalışan Yönetimi", active: true },
    { icon: Clock, label: "İzin Yönetimi" },
    { icon: Wallet, label: "Maaş Yönetimi" },
    { icon: BarChart3, label: "Performans" },
    { icon: GanttChartSquare, label: "Görev Yönetimi" },
  ];

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 fixed left-[60px] top-0">
      <div className="space-y-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              item.active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const TopBar = () => {
  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Çalışan Yönetimi</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>YK</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">Yönetici Kullanıcı</p>
            <p className="text-xs text-gray-500">yonetici@firma.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterBar = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Çalışan ara..."
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Departman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Departmanlar</SelectItem>
            <SelectItem value="it">Bilgi Teknolojileri</SelectItem>
            <SelectItem value="hr">İnsan Kaynakları</SelectItem>
            <SelectItem value="finance">Finans</SelectItem>
            <SelectItem value="sales">Satış</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="onleave">İzinde</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="shrink-0">
        <PlusCircle className="h-5 w-5 mr-2" />
        Yeni Çalışan
      </Button>
    </div>
  );
};

const EmployeeTable = () => {
  const employees = [
    {
      id: 1,
      name: "Ali Yılmaz",
      position: "Yazılım Geliştirici",
      department: "Bilgi Teknolojileri",
      email: "ali.yilmaz@firma.com",
      status: "Aktif",
      imageUrl: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      name: "Ayşe Demir",
      position: "İK Uzmanı",
      department: "İnsan Kaynakları",
      email: "ayse.demir@firma.com",
      status: "İzinde",
      imageUrl: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: 3,
      name: "Mehmet Kaya",
      position: "Satış Müdürü",
      department: "Satış",
      email: "mehmet.kaya@firma.com",
      status: "Aktif",
      imageUrl: "https://i.pravatar.cc/150?img=3"
    },
    {
      id: 4,
      name: "Zeynep Şahin",
      position: "Finans Analisti",
      department: "Finans",
      email: "zeynep.sahin@firma.com",
      status: "Aktif",
      imageUrl: "https://i.pravatar.cc/150?img=4"
    },
  ];

  return (
    <div className="bg-white rounded-lg border">
      <div className="min-w-full divide-y">
        <div className="bg-gray-50 px-6 py-3">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-2 text-sm font-medium text-gray-500">ÇALIŞAN</div>
            <div className="text-sm font-medium text-gray-500">DEPARTMAN</div>
            <div className="text-sm font-medium text-gray-500">E-POSTA</div>
            <div className="text-sm font-medium text-gray-500">DURUM</div>
            <div className="text-sm font-medium text-gray-500">İŞLEMLER</div>
          </div>
        </div>
        <div className="divide-y">
          {employees.map((employee) => (
            <div key={employee.id} className="px-6 py-4 transition-colors hover:bg-gray-50">
              <div className="grid grid-cols-6 gap-4 items-center">
                <div className="col-span-2">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.imageUrl} />
                      <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.position}</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-900">{employee.department}</div>
                <div className="text-sm text-gray-900">{employee.email}</div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    employee.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                    employee.status === 'İzinde' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.status}
                  </span>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Detaylar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Employees = ({ isCollapsed, setIsCollapsed }: EmployeesProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <EmployeeManagementMenu />
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'ml-[calc(60px+16rem)]' : 'ml-[calc(16rem+16rem)]'
      }`}>
        <TopBar />
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
          <FilterBar />
          <EmployeeTable />
        </main>
      </div>
    </div>
  );
};

export default Employees;
