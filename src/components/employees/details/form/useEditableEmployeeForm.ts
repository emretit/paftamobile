
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
    date_of_birth: employee.date_of_birth || "",
    gender: employee.gender || "",
    marital_status: employee.marital_status || "",
    address: employee.address || "",
    city: employee.city || "",
    postal_code: employee.postal_code || "",
    country: employee.country || "",
    district: employee.district || "",
    id_ssn: employee.id_ssn || "",
    emergency_contact_name: employee.emergency_contact_name || "",
    emergency_contact_phone: employee.emergency_contact_phone || "",
    emergency_contact_relation: employee.emergency_contact_relation || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    console.log(`Field ${field} changed to: ${value}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("Submitting form with data:", formData);
    
    try {
      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      console.log("Sending update with data:", updateData);

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employee.id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Employee updated successfully, response:", data);

      // Call onSave to update the parent component state
      onSave({
        ...employee,
        ...formData,
      });
      
      toast({
        title: "Başarılı",
        description: "Çalışan bilgileri başarıyla güncellendi.",
      });
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
  };
};
