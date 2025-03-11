
import { useEmployeeForm } from "./useEmployeeForm";
import { BasicInformation } from "./sections/BasicInformation";
import { AdditionalInformation } from "./sections/AdditionalInformation";
import { FormActions } from "./FormActions";
import { useEmployeeDepartments } from "./useEmployeeDepartments";
import type { Employee } from "../types";

interface EmployeeFormWrapperProps {
  initialData?: Employee;
  onSuccess?: () => void;
}

export const EmployeeFormWrapper = ({ initialData, onSuccess }: EmployeeFormWrapperProps) => {
  const departments = useEmployeeDepartments();
  
  const {
    formData,
    formErrors,
    isLoading,
    handleFormChange,
    handleSubmit,
    handleFileChange,
    selectedFile,
    isEditMode
  } = useEmployeeForm(initialData, onSuccess);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BasicInformation
        formData={formData}
        departments={departments}
        onFormChange={handleFormChange}
        errors={formErrors}
        isEditMode={isEditMode}
      />

      <AdditionalInformation
        formData={formData}
        onFormChange={handleFormChange}
        errors={formErrors}
        onFileChange={handleFileChange}
        selectedFile={selectedFile}
      />

      <FormActions 
        isLoading={isLoading} 
        isEditMode={isEditMode}
        onCancel={() => window.history.back()}
      />
    </form>
  );
};
