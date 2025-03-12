
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Employee } from "@/types/employee";

interface UseEditableEmployeeFormProps {
  employee: Employee;
  onSuccess?: () => void;
}

export const useEditableEmployeeForm = ({ 
  employee, 
  onSuccess 
}: UseEditableEmployeeFormProps) => {
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (updatedData: Partial<Employee>) => {
    if (!employee?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("employees")
        .update(updatedData)
        .eq("id", employee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee details updated successfully.",
      });
      
      setIsEditing(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update employee details.",
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
