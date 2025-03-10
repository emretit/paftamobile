
import Navbar from "@/components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/components/employees/types";
import { EmployeeDetailsView } from "@/components/employees/details/EmployeeDetailsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeSalaryTab } from "@/components/employees/details/EmployeeSalaryTab";
import { EmployeeLeaveTab } from "@/components/employees/details/EmployeeLeaveTab";
import { EmployeePerformanceTab } from "@/components/employees/details/EmployeePerformanceTab";
import { EmployeeTasksTab } from "@/components/employees/details/EmployeeTasksTab";

interface EmployeeDetailsPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const EmployeeDetails = ({ isCollapsed, setIsCollapsed }: EmployeeDetailsPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Veriyi Employee tipine dönüştür
        const employeeData: Employee = {
          ...data,
          status: data.status === 'active' ? 'active' : 'inactive'
        };
        
        setEmployee(employeeData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Çalışan bilgileri yüklenirken bir hata oluştu.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id, toast]);

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!employee) {
    return <div>Çalışan bulunamadı.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/employees")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </button>
            <Button
              onClick={() => navigate(`/employees/${id}/edit`)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Düzenle
            </Button>
          </div>
          
          <div className="mb-6">
            <EmployeeDetailsView employee={employee} />
          </div>
          
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
              <TabsTrigger value="salary">Maaş Yönetimi</TabsTrigger>
              <TabsTrigger value="leave">İzin Yönetimi</TabsTrigger>
              <TabsTrigger value="performance">Performans</TabsTrigger>
              <TabsTrigger value="tasks">Görevler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Çalışan Detayları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Adı Soyadı</p>
                    <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Departman</p>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pozisyon</p>
                    <p className="font-medium">{employee.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">E-posta</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="font-medium">{employee.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
                    <p className="font-medium">{new Date(employee.hire_date).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="salary" className="mt-6">
              <EmployeeSalaryTab employeeId={employee.id} />
            </TabsContent>
            
            <TabsContent value="leave" className="mt-6">
              <EmployeeLeaveTab employeeId={employee.id} />
            </TabsContent>
            
            <TabsContent value="performance" className="mt-6">
              <EmployeePerformanceTab employeeId={employee.id} />
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-6">
              <EmployeeTasksTab employeeId={employee.id} employeeName={`${employee.first_name} ${employee.last_name}`} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDetails;
