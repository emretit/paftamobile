import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, TrendingUp, FileDown, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmployeeCostData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  status: string;
  gross_salary: number;
  net_salary: number;
  total_employer_cost: number;
  meal_allowance: number;
  transport_allowance: number;
  effective_date: string;
  sgk_employer_amount: number;
  unemployment_employer_amount: number;
  accident_insurance_amount: number;
}

interface DepartmentSummary {
  department: string;
  employee_count: number;
  total_gross_salary: number;
  total_net_salary: number;
  total_employer_cost: number;
}

const EmployeeCosts = () => {
  const [employeeCosts, setEmployeeCosts] = useState<EmployeeCostData[]>([]);
  const [filteredCosts, setFilteredCosts] = useState<EmployeeCostData[]>([]);
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeCosts();
  }, []);

  useEffect(() => {
    filterData();
  }, [employeeCosts, searchTerm, selectedDepartment, selectedStatus]);

  const fetchEmployeeCosts = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          email,
          department,
          position,
          status,
          employee_salaries (
            gross_salary,
            net_salary,
            total_employer_cost,
            meal_allowance,
            transport_allowance,
            effective_date,
            sgk_employer_amount,
            unemployment_employer_amount,
            accident_insurance_amount
          )
        `)
        .eq('status', 'aktif')
        .order('department')
        .order('last_name');

      if (error) throw error;

      const processedData = data
        .filter(employee => employee.employee_salaries && Array.isArray(employee.employee_salaries) && employee.employee_salaries.length > 0)
        .map(employee => {
          const salariesArray = Array.isArray(employee.employee_salaries) ? employee.employee_salaries : [employee.employee_salaries];
          const latestSalary = salariesArray[0]; // Get the latest salary record
          return {
            id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            department: employee.department,
            position: employee.position,
            status: employee.status,
            gross_salary: latestSalary.gross_salary || 0,
            net_salary: latestSalary.net_salary || 0,
            total_employer_cost: latestSalary.total_employer_cost || 0,
            meal_allowance: latestSalary.meal_allowance || 0,
            transport_allowance: latestSalary.transport_allowance || 0,
            effective_date: latestSalary.effective_date,
            sgk_employer_amount: latestSalary.sgk_employer_amount || 0,
            unemployment_employer_amount: latestSalary.unemployment_employer_amount || 0,
            accident_insurance_amount: latestSalary.accident_insurance_amount || 0,
          };
        });

      setEmployeeCosts(processedData);
      calculateDepartmentSummary(processedData);
    } catch (error) {
      console.error('Error fetching employee costs:', error);
      toast({
        title: "Hata",
        description: "Personel maliyetleri yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDepartmentSummary = (data: EmployeeCostData[]) => {
    const summary = data.reduce((acc, employee) => {
      const dept = employee.department;
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          employee_count: 0,
          total_gross_salary: 0,
          total_net_salary: 0,
          total_employer_cost: 0,
        };
      }
      
      acc[dept].employee_count += 1;
      acc[dept].total_gross_salary += employee.gross_salary;
      acc[dept].total_net_salary += employee.net_salary;
      acc[dept].total_employer_cost += employee.total_employer_cost;
      
      return acc;
    }, {} as Record<string, DepartmentSummary>);

    setDepartmentSummary(Object.values(summary));
  };

  const filterData = () => {
    let filtered = employeeCosts;

    if (searchTerm) {
      filtered = filtered.filter(employee => 
        employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(employee => employee.department === selectedDepartment);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(employee => employee.status === selectedStatus);
    }

    setFilteredCosts(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = [
      'Ad Soyad',
      'E-posta',
      'Departman',
      'Pozisyon',
      'Brüt Maaş',
      'Net Maaş',
      'Toplam İşveren Maliyeti',
      'Yemek Yardımı',
      'Ulaşım Yardımı',
      'SGK İşveren Payı',
      'İşsizlik İşveren Payı',
      'İş Kazası Sigortası'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredCosts.map(employee => [
        `"${employee.first_name} ${employee.last_name}"`,
        `"${employee.email}"`,
        `"${employee.department}"`,
        `"${employee.position}"`,
        employee.gross_salary,
        employee.net_salary,
        employee.total_employer_cost,
        employee.meal_allowance,
        employee.transport_allowance,
        employee.sgk_employer_amount,
        employee.unemployment_employer_amount,
        employee.accident_insurance_amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `personel_maliyetleri_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCosts = filteredCosts.reduce((acc, employee) => ({
    gross_salary: acc.gross_salary + employee.gross_salary,
    net_salary: acc.net_salary + employee.net_salary,
    total_employer_cost: acc.total_employer_cost + employee.total_employer_cost,
  }), { gross_salary: 0, net_salary: 0, total_employer_cost: 0 });

  const uniqueDepartments = [...new Set(employeeCosts.map(emp => emp.department))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Personel maliyetleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Personel Maliyetleri</h2>
          <p className="text-gray-600">Aktif çalışanların detaylı maaş ve maliyet bilgileri</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          CSV İndir
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Çalışan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{filteredCosts.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Brüt Maaş</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{formatCurrency(totalCosts.gross_salary)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Net Maaş</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{formatCurrency(totalCosts.net_salary)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam İşveren Maliyeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{formatCurrency(totalCosts.total_employer_cost)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Departman Özeti</CardTitle>
          <CardDescription>Departman bazında personel maliyetleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentSummary.map((dept) => (
              <div key={dept.department} className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{dept.department}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Çalışan Sayısı:</span>
                    <span className="font-medium">{dept.employee_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Brüt:</span>
                    <span className="font-medium">{formatCurrency(dept.total_gross_salary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Net:</span>
                    <span className="font-medium">{formatCurrency(dept.total_net_salary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">İşveren Maliyeti:</span>
                    <span className="font-medium text-red-600">{formatCurrency(dept.total_employer_cost)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Departman seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Departmanlar</SelectItem>
            {uniqueDepartments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detaylı Personel Maliyetleri</CardTitle>
          <CardDescription>Tüm aktif çalışanların maaş ve maliyet detayları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>Pozisyon</TableHead>
                  <TableHead className="text-right">Brüt Maaş</TableHead>
                  <TableHead className="text-right">Net Maaş</TableHead>
                  <TableHead className="text-right">İşveren Maliyeti</TableHead>
                  <TableHead className="text-right">Yemek</TableHead>
                  <TableHead className="text-right">Ulaşım</TableHead>
                  <TableHead className="text-right">SGK İşveren</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(employee.gross_salary)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(employee.net_salary)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {formatCurrency(employee.total_employer_cost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.meal_allowance)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.transport_allowance)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(employee.sgk_employer_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Aktif
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeCosts;