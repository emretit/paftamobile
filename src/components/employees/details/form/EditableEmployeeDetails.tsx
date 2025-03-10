
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Employee } from "../../types";
import { useEditableEmployeeForm } from "./useEditableEmployeeForm";
import { FormFields } from "./FormFields";

interface EditableEmployeeDetailsProps {
  employee: Employee;
  onSave: (employee: Employee) => void;
}

export const EditableEmployeeDetails = ({ employee, onSave }: EditableEmployeeDetailsProps) => {
  const {
    formData,
    departments,
    isLoading,
    handleInputChange,
    handleSubmit,
  } = useEditableEmployeeForm(employee, onSave);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-end mb-4">
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
        <FormFields 
          formData={formData}
          departments={departments}
          handleInputChange={handleInputChange}
          isEditing={true}
        />
      </form>
    </div>
  );
};
