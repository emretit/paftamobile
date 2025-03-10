
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
        <PersonalInfoForm 
          formData={formData} 
          handleInputChange={handleInputChange} 
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
