
import { useParams, useNavigate } from "react-router-dom";
import { PersonalInfo } from "./PersonalInfo";
import { RoleInfo } from "./RoleInfo";
import { StatusInfo } from "./StatusInfo";
import { ImageUpload } from "./ImageUpload";
import { FormActions } from "./FormActions";
import { useEmployeeForm } from "./useEmployeeForm";
import { useEmployeeDepartments } from "./useEmployeeDepartments";
import type { Employee } from "../types";

interface EmployeeFormWrapperProps {
  initialData?: Employee;
}

export const EmployeeFormWrapper = ({ initialData }: EmployeeFormWrapperProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  } = useEmployeeForm(initialData);

  const handleCancel = () => {
    navigate(id ? `/employees/${id}` : "/employees");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfo
        formData={formData}
        onFormChange={handleFormChange}
        errors={formErrors}
        isEditMode={isEditMode}
      />

      <RoleInfo
        formData={formData}
        departments={departments}
        onFormChange={handleFormChange}
        errors={formErrors}
      />

      <StatusInfo
        formData={formData}
        onFormChange={handleFormChange}
        errors={formErrors}
      />

      <ImageUpload
        onFileChange={handleFileChange}
        selectedFile={selectedFile}
      />

      <FormActions 
        isLoading={isLoading} 
        isEditMode={isEditMode}
        onCancel={handleCancel}
      />
    </form>
  );
};
