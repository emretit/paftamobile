
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Employee } from "@/components/employees/types";
import { EmployeeDetailsView } from "./EmployeeDetailsView";
import { EmployeeSalaryTab } from "./EmployeeSalaryTab";
import { EmployeeLeaveTab } from "./EmployeeLeaveTab";
import { EmployeePerformanceTab } from "./EmployeePerformanceTab";
import { EmployeeTasksTab } from "./EmployeeTasksTab";

interface EmployeeDetailPanelProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeDetailPanel = ({ employee, isOpen, onClose }: EmployeeDetailPanelProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");

  if (!employee) {
    return null;
  }

  const handleViewFullDetails = () => {
    navigate(`/employees/${employee.id}`);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center">
            <SheetTitle>Çalışan Detayları</SheetTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewFullDetails}
              className="flex items-center gap-1"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Tam Görünüm</span>
            </Button>
          </div>
        </SheetHeader>
        
        <div className="mb-6">
          <EmployeeDetailsView employee={employee} />
        </div>
          
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-1 shadow-sm">
            <TabsTrigger value="details" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="salary" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Maaş</TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">İzin</TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Performans</TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Görevler</TabsTrigger>
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
      </SheetContent>
    </Sheet>
  );
};
