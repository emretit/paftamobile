
import type { Employee } from "../../types";
import { BasicInfoFields } from "./sections/BasicInfoFields";
import { PersonalInfoFields } from "./sections/PersonalInfoFields";
import { AddressFields } from "./sections/AddressFields";
import { EmergencyContactFields } from "./sections/EmergencyContactFields";

interface FormFieldsProps {
  formData: Partial<Employee>;
  departments: { name: string }[];
  handleInputChange?: (field: string, value: string) => void;
  isEditing?: boolean;
  showExtendedInfo?: boolean;
}

export const FormFields = ({ 
  formData, 
  departments, 
  handleInputChange, 
  isEditing = false,
  showExtendedInfo = true // Changed default to true to always show extended info
}: FormFieldsProps) => {
  return (
    <div className="space-y-6">
      <BasicInfoFields
        formData={formData}
        departments={departments}
        handleInputChange={handleInputChange}
        isEditing={isEditing}
      />
      
      {/* Extended personal information sections - now always shown */}
      {showExtendedInfo && (
        <>
          <PersonalInfoFields
            formData={formData}
            handleInputChange={handleInputChange}
            isEditing={isEditing}
          />
          
          <AddressFields
            formData={formData}
            handleInputChange={handleInputChange}
            isEditing={isEditing}
          />
          
          <EmergencyContactFields
            formData={formData}
            handleInputChange={handleInputChange}
            isEditing={isEditing}
          />
        </>
      )}
    </div>
  );
};
