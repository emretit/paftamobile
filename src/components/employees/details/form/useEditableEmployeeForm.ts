
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Employee } from "../../types";
import { useEmployeeDepartments } from "../../form/useEmployeeDepartments";

export const useEditableEmployeeForm = (employee: Employee, onSave: (employee: Employee) => void) => {
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

  return {
    formData,
    departments,
    isLoading,
    handleInputChange,
    handleSubmit,
    shouldShowDepartment: formData.position !== 'Admin'
  };
};
