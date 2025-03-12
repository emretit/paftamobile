
import { Employee } from "@/types/employee";
import { SaveButton } from "./components/SaveButton";
import { FormFields } from "./FormFields";

interface EditableEmployeeDetailsProps {
  employee: Employee;
  onSave: (employee: Employee) => void;
  isEditing?: boolean;
  isSaving?: boolean;
  handleEdit?: () => void;
  handleCancel?: () => void;
  handleSave: (updatedData: Partial<Employee>) => Promise<void>;
}

export const EditableEmployeeDetails = ({ 
  employee, 
  onSave,
  isEditing = true,
  isSaving = false,
  handleSave
}: EditableEmployeeDetailsProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex justify-end mb-6">
        <SaveButton 
          isLoading={isSaving} 
          onClick={() => handleSave(employee)} 
        />
      </div>
      
      <FormFields
        formData={employee}
        departments={[]}
        handleInputChange={() => {}}
        isEditing={isEditing}
      />
    </div>
  );
};
