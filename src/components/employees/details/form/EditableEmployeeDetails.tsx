
import type { Employee } from "../../types";
import { useEditableEmployeeForm } from "./useEditableEmployeeForm";
import { SaveButton } from "./components/SaveButton";
import { EmployeeForm } from "./components/EmployeeForm";

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
        <SaveButton isLoading={isLoading} onClick={handleSubmit} />
      </div>
      
      <EmployeeForm
        formData={formData}
        departments={departments}
        handleInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
