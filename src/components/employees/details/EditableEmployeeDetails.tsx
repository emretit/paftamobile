
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Employee } from "../types";
import { useEditableEmployeeForm } from "./form/useEditableEmployeeForm";
import { PersonalInfoForm } from "./form/PersonalInfoForm";
import { PositionFields } from "./form/PositionFields";
import { StatusFields } from "./form/StatusFields";

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
    shouldShowDepartment
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
        <PersonalInfoForm 
          formData={formData} 
          handleInputChange={handleInputChange} 
          departments={departments}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PositionFields 
            formData={formData} 
            departments={departments} 
            shouldShowDepartment={shouldShowDepartment}
            handleInputChange={handleInputChange} 
          />
          
          <StatusFields 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        </div>
      </form>
    </div>
  );
};
