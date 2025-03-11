
import type { Employee } from "../../../types";
import { FormFields } from "../FormFields";

interface EmployeeFormProps {
  formData: Partial<Employee>;
  departments: { name: string }[];
  handleInputChange: (field: string, value: string) => void;
}

export const EmployeeForm = ({ 
  formData, 
  departments, 
  handleInputChange 
}: EmployeeFormProps) => {
  return (
    <form className="space-y-6">
      <FormFields 
        formData={formData}
        departments={departments}
        handleInputChange={handleInputChange}
        isEditing={true}
        showExtendedInfo={true}
      />
    </form>
  );
};
