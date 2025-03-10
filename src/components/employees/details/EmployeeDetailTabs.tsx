
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
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('tr-TR');
    } catch (error) {
      return dateString;
    }
  };
  
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
          
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-sm text-gray-500">Adı Soyadı</p>
                <p className="font-medium text-gray-800">{employee.first_name} {employee.last_name}</p>
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
                <p className="text-sm text-gray-500">Departman</p>
                <p className="font-medium text-gray-800">{employee.department}</p>
              </div>
              <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-sm text-gray-500">Pozisyon</p>
                <p className="font-medium text-gray-800">{employee.position}</p>
              </div>
              <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-sm text-gray-500">İşe Başlama Tarihi</p>
                <p className="font-medium text-gray-800">{formatDate(employee.hire_date)}</p>
              </div>
            </div>
            
            {(employee.date_of_birth || employee.gender || employee.marital_status || 
             employee.address || employee.city || employee.postal_code || employee.id_ssn) && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-4 border-b pb-2">Kişisel Detaylar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {employee.date_of_birth && (
                    <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-500">Doğum Tarihi</p>
                      <p className="font-medium text-gray-800">{formatDate(employee.date_of_birth)}</p>
                    </div>
                  )}
                  {employee.gender && (
                    <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-500">Cinsiyet</p>
                      <p className="font-medium text-gray-800">
                        {employee.gender === 'male' ? 'Erkek' : 
                         employee.gender === 'female' ? 'Kadın' : 
                         employee.gender === 'other' ? 'Diğer' : 
                         employee.gender === 'prefer_not_to_say' ? 'Belirtilmemiş' : 
                         employee.gender}
                      </p>
                    </div>
                  )}
                  {employee.marital_status && (
                    <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-500">Medeni Durum</p>
                      <p className="font-medium text-gray-800">
                        {employee.marital_status === 'single' ? 'Bekâr' : 
                         employee.marital_status === 'married' ? 'Evli' : 
                         employee.marital_status === 'divorced' ? 'Boşanmış' : 
                         employee.marital_status === 'widowed' ? 'Dul' : 
                         employee.marital_status}
                      </p>
                    </div>
                  )}
                  {employee.id_ssn && (
                    <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-500">TC Kimlik No / SGK No</p>
                      <p className="font-medium text-gray-800">{employee.id_ssn}</p>
                    </div>
                  )}
                  {(employee.address || employee.city || employee.postal_code) && (
                    <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors md:col-span-2">
                      <p className="text-sm text-gray-500">Adres</p>
                      <p className="font-medium text-gray-800">
                        {[
                          employee.address, 
                          employee.city, 
                          employee.postal_code
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {(employee.emergency_contact_name || employee.emergency_contact_phone || employee.emergency_contact_relation) && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-4 border-b pb-2">Acil Durum İletişim Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {employee.emergency_contact_name && (
                    <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-500">İletişim Kişisi</p>
                      <p className="font-medium text-gray-800">{employee.emergency_contact_name}</p>
                    </div>
                  )}
                  {employee.emergency_contact_phone && (
                    <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="font-medium text-gray-800">{employee.emergency_contact_phone}</p>
                    </div>
                  )}
                  {employee.emergency_contact_relation && (
                    <div className="space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <p className="text-sm text-gray-500">Yakınlık Derecesi</p>
                      <p className="font-medium text-gray-800">{employee.emergency_contact_relation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
