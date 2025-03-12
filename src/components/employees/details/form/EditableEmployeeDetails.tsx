
import { Employee } from "@/types/employee";
import { useEditableEmployeeForm } from "@/hooks/useEditableEmployeeForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { FormFields } from "./FormFields";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EditableEmployeeDetailsProps {
  employee: Employee;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditableEmployeeDetails = ({
  employee,
  onCancel,
  onSuccess
}: EditableEmployeeDetailsProps) => {
  const { isEditing, isSaving, handleEdit, handleCancel, handleSave } = useEditableEmployeeForm({
    employee,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee details updated successfully"
      });
      onSuccess();
    }
  });

  const [formData, setFormData] = useState<Partial<Employee>>(employee);
  const [departments, setDepartments] = useState<{ name: string }[]>([]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase
        .from('departments')
        .select('name')
        .order('name');
      
      setDepartments(data || [
        { name: "Engineering" },
        { name: "Sales" },
        { name: "Marketing" },
        { name: "Finance" },
        { name: "HR" },
        { name: "Operations" }
      ]);
    };

    fetchDepartments();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Employee Details</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSave(formData)}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
        <FormFields 
          formData={formData}
          departments={departments}
          handleInputChange={handleInputChange}
          isEditing={true}
        />
      </div>
    </Card>
  );
};
