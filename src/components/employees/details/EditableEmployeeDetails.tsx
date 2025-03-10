
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useEmployeeDepartments } from "../form/useEmployeeDepartments";
import type { Employee } from "../types";
import { POSITIONS } from "../form/types";

interface EditableEmployeeDetailsProps {
  employee: Employee;
  onSave: (employee: Employee) => void;
}

export const EditableEmployeeDetails = ({ employee, onSave }: EditableEmployeeDetailsProps) => {
  const { toast } = useToast();
  const departments = useEmployeeDepartments();
  const [formData, setFormData] = useState({
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone || "",
    position: employee.position,
    department: employee.department,
    hire_date: employee.hire_date,
    status: employee.status,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
          position: formData.position,
          department: formData.department,
          hire_date: formData.hire_date,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', employee.id);

      if (error) throw error;

      // Update the employee object
      const updatedEmployee: Employee = {
        ...employee,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        position: formData.position,
        department: formData.department,
        hire_date: formData.hire_date,
        status: formData.status as 'active' | 'inactive',
      };

      onSave(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Hata",
        description: "Çalışan bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin positions don't need a department
  const shouldShowDepartment = formData.position !== 'Admin';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Çalışan Detayları</h3>
        <Button 
          type="submit" 
          className="flex items-center gap-2" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
      
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name">Adı</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name">Soyadı</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              readOnly
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">E-posta adresi değiştirilemez.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+90 500 000 0000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Pozisyon</Label>
            <Select
              value={formData.position}
              onValueChange={(value) => {
                handleInputChange('position', value);
                if (value === 'Admin') {
                  handleInputChange('department', '');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pozisyon seçin" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {shouldShowDepartment && (
            <div className="space-y-2">
              <Label htmlFor="department">Departman</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.name}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="hire_date">İşe Başlama Tarihi</Label>
            <Input
              id="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={(e) => handleInputChange('hire_date', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Durum</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') => 
                handleInputChange('status', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </div>
  );
};
