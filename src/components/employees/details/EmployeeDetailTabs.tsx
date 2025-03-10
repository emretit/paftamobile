
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableEmployeeDetails } from "./EditableEmployeeDetails";
import { EmployeeSalaryTab } from "./EmployeeSalaryTab";
import { EmployeeLeaveTab } from "./EmployeeLeaveTab";
import { EmployeePerformanceTab } from "./EmployeePerformanceTab";
import { EmployeeTasksTab } from "./EmployeeTasksTab";
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
    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
        <TabsTrigger value="salary">Maaş Yönetimi</TabsTrigger>
        <TabsTrigger value="leave">İzin Yönetimi</TabsTrigger>
        <TabsTrigger value="performance">Performans</TabsTrigger>
        <TabsTrigger value="tasks">Görevler</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="mt-6">
        {isEditing ? (
          <EditableEmployeeDetails 
            employee={employee} 
            onSave={handleEmployeeUpdate} 
          />
        ) : (
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
        )}
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
