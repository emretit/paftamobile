
import { useState } from "react";
import { Employee } from "@/types/employee";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseEditableEmployeeFormProps {
  employee: Employee;
  onSuccess?: () => void;
}

export const useEditableEmployeeForm = ({ employee, onSuccess }: UseEditableEmployeeFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (updatedEmployee: Partial<Employee>) => {
    try {
      setIsSaving(true);

      // Create a copy of the employee to avoid modifying the original
      const employeeToUpdate = { ...updatedEmployee };
      
      // Normalize status to match database expectations
      // Important: The database expects 'aktif' or 'pasif', but the UI might use 'active' or 'inactive'
      if (employeeToUpdate.status) {
        if (employeeToUpdate.status === 'active') {
          employeeToUpdate.status = 'aktif' as any;
        } else if (employeeToUpdate.status === 'inactive') {
          employeeToUpdate.status = 'pasif' as any;
        }
      }

      const { error } = await supabase
        .from('employees')
        .update(employeeToUpdate as any)
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee details updated successfully",
      });

      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update employee details",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    isSaving,
    handleEdit,
    handleCancel,
    handleSave,
  };
};
