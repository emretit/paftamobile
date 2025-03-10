
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableEmployeeDetails } from "./EditableEmployeeDetails";
import { EmployeeSalaryTab } from "./EmployeeSalaryTab";
import { EmployeeLeaveTab } from "./EmployeeLeaveTab";
import { EmployeePerformanceTab } from "./EmployeePerformanceTab";
import { EmployeeTasksTab } from "./EmployeeTasksTab";
import { User, DollarSign, Calendar, BarChart2, CheckSquare } from "lucide-react";
import type { Employee } from "../types";

interface EmployeeDetailTabsProps {
  employee: Employee;
  activeTab: string;
  setActiveTab: (value: string) => void;
  isEditing: boolean;
  handleEmployeeUpdate: (updatedEmployee: Employee) => void;
}

export const EmployeeDetailTabs = ({ 
  employee, 
  activeTab, 
  setActiveTab, 
  isEditing, 
  handleEmployeeUpdate 
}: EmployeeDetailTabsProps) => {
  return (
    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in">
      <TabsList className="w-full sticky top-4 z-10">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Genel Bilgiler</span>
        </TabsTrigger>
        <TabsTrigger value="salary" className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span className="hidden sm:inline">Maaş</span>
        </TabsTrigger>
        <TabsTrigger value="leave" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">İzin</span>
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          <span className="hidden sm:inline">Performans</span>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Görevler</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium mb-6 text-gray-800 flex items-center border-b border-gray-100 pb-4">
            <User className="w-5 h-5 mr-2 text-primary" />
            Çalışan Detayları
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Adı Soyadı</p>
              <p className="font-medium text-gray-800">{employee.first_name} {employee.last_name}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Departman</p>
              <p className="font-medium text-gray-800">{employee.department}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Pozisyon</p>
              <p className="font-medium text-gray-800">{employee.position}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">E-posta</p>
              <p className="font-medium text-gray-800">{employee.email}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="font-medium text-gray-800">{employee.phone || "-"}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
              <p className="font-medium text-gray-800">{new Date(employee.hire_date).toLocaleDateString('tr-TR')}</p>
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
  );
};
