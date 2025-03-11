
import { useEmployeeForm } from "./useEmployeeForm";
import { PersonalInfo } from "./PersonalInfo";
import { RoleInfo } from "./RoleInfo";
import { StatusInfo } from "./StatusInfo";
import { ImageUpload } from "./ImageUpload";
import { FormActions } from "./FormActions";
import { ExtendedPersonalInfo } from "./ExtendedPersonalInfo";
import { EmergencyContactInfo } from "./EmergencyContactInfo";
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
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
        
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
      </div>

      {/* Extended Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <ExtendedPersonalInfo
          formData={formData}
          onFormChange={handleFormChange}
          errors={formErrors}
        />
      </div>

      {/* Emergency Contact */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <EmergencyContactInfo
          formData={formData}
          onFormChange={handleFormChange}
          errors={formErrors}
        />
      </div>

      {/* Image Upload */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Image</h2>
        <ImageUpload
          onFileChange={handleFileChange}
          selectedFile={selectedFile}
        />
      </div>

      {/* Form Actions */}
      <FormActions 
        isLoading={isLoading} 
        isEditMode={isEditMode}
        onCancel={() => window.history.back()}
      />
    </form>
  );
};
