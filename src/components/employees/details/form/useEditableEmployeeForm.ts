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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("Submitting form with status:", formData.status);
    
    try {
      // For status, we need to ensure it's either 'active' or 'inactive'
      // However, in the database, 'aktif' is also a valid value (it's the Turkish equivalent)
      // So we need to check if the status is 'active' and keep it, otherwise set it to the original value
      const statusValue = formData.status === 'active' ? 'active' : 
                         (formData.status === 'inactive' ? 'inactive' : employee.status);
      
      const { error } = await supabase
        .from('employees')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          position: formData.position,
          department: formData.department,
          hire_date: formData.hire_date,
          // Use the original status if it's not explicitly changed to active/inactive
          status: statusValue,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          marital_status: formData.marital_status || null,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          id_ssn: formData.id_ssn || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          emergency_contact_relation: formData.emergency_contact_relation || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', employee.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Employee updated successfully");

      // Create updated employee object with the original status if needed
      const updatedEmployee: Employee = {
        ...employee,
        ...formData,
        status: statusValue,
      };

      // Call onSave to update the parent component state
      onSave(updatedEmployee);
      
      toast({
        title: "Success",
        description: "Employee information updated successfully.",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating employee information.",
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
