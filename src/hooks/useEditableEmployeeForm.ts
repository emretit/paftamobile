
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
        title: "Başarılı",
        description: "Çalışan bilgileri başarıyla güncellendi",
      });

      setIsEditing(false);
      onSuccess?.();
    } catch (error) {
      console.error('Çalışan güncellenirken hata:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan bilgileri güncellenirken bir hata oluştu",
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
