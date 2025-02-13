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
  Bell,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  Mail,
  Calendar,
  Building2,
  BadgeCheck,
  MoreHorizontal
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  hire_date: string;
  status: 'aktif' | 'pasif' | 'izinli' | 'ayrıldı';
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

interface EmployeesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Ad, e-posta veya telefon ile ara..."
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Departman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Departmanlar</SelectItem>
            <SelectItem value="sales">Satış</SelectItem>
            <SelectItem value="tech">Teknik Destek</SelectItem>
            <SelectItem value="finance">Muhasebe</SelectItem>
            <SelectItem value="logistics">Lojistik</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="izinli">İzinli</SelectItem>
            <SelectItem value="pasif">Pasif</SelectItem>
            <SelectItem value="ayrıldı">Ayrıldı</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <div className="flex rounded-md border">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('table')}
            className="rounded-r-none"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="rounded-l-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Button>
          <PlusCircle className="h-5 w-5 mr-2" />
          Yeni Çalışan
        </Button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Employee['status'] }) => {
  const styles = {
    aktif: 'bg-green-100 text-green-800',
    pasif: 'bg-gray-100 text-gray-800',
    izinli: 'bg-yellow-100 text-yellow-800',
    ayrıldı: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const EmployeeGrid = ({ employees }: { employees: Employee[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {employees.map((employee) => (
        <Card key={employee.id}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={employee.avatar_url || undefined} />
                <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{employee.first_name} {employee.last_name}</h3>
              <p className="text-sm text-gray-500">{employee.position}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                {employee.department}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                {employee.email}
              </div>
              {employee.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {employee.phone}
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {new Date(employee.hire_date).toLocaleDateString('tr-TR')}
              </div>
              <div className="flex items-center text-sm">
                <BadgeCheck className="h-4 w-4 mr-2 text-gray-500" />
                <StatusBadge status={employee.status} />
              </div>
              <div className="pt-4 flex justify-center gap-2">
                <Button variant="outline" size="sm">Detaylar</Button>
                <Button variant="outline" size="sm">Düzenle</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const EmployeeTable = ({ employees }: { employees: Employee[] }) => {
  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">ÇALIŞAN</TableHead>
            <TableHead>DEPARTMAN</TableHead>
            <TableHead>İŞE BAŞLAMA</TableHead>
            <TableHead>E-POSTA</TableHead>
            <TableHead>TELEFON</TableHead>
            <TableHead>DURUM</TableHead>
            <TableHead className="text-right">İŞLEMLER</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar_url || undefined} />
                    <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                    <div className="text-sm text-gray-500">{employee.position}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{new Date(employee.hire_date).toLocaleDateString('tr-TR')}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.phone || '-'}</TableCell>
              <TableCell>
                <StatusBadge status={employee.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">Detaylar</Button>
                  <Button variant="outline" size="sm">Düzenle</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const EmployeeList = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }

      setEmployees(data);
    };

    fetchEmployees();
  }, []);

  return (
    <>
      <FilterBar />
      {viewMode === 'table' ? (
        <EmployeeTable employees={employees} />
      ) : (
        <EmployeeGrid employees={employees} />
      )}
    </>
  );
};

const Employees = ({ isCollapsed, setIsCollapsed }: EmployeesProps) => {
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
