
import { useEditableEmployeeForm } from "./useEditableEmployeeForm";
import { SaveButton } from "./components/SaveButton";
import { FormFields } from "./FormFields";
import type { Employee } from "../../types";

interface EditableEmployeeDetailsProps {
  employee: Employee;
  onSave: (employee: Employee) => void;
  isEditing?: boolean;
}

export const EditableEmployeeDetails = ({ 
  employee, 
  onSave,
  isEditing = true
}: EditableEmployeeDetailsProps) => {
  const {
    formData,
    departments,
    isLoading,
    handleInputChange,
    handleSubmit,
  } = useEditableEmployeeForm(employee, onSave);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex justify-end mb-6">
        <SaveButton 
          isLoading={isLoading} 
          onClick={handleSubmit} 
        />
      </div>
      
      <FormFields
        formData={formData}
        departments={departments}
        handleInputChange={handleInputChange}
        isEditing={isEditing}
      />
    </div>
  );
};
