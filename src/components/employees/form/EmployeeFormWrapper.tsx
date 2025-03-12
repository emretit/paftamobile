
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalInfo } from "./PersonalInfo";
import { RoleInfo } from "./RoleInfo";
import { FormActions } from "./FormActions";
import { StatusInfo } from "./StatusInfo";
import { Employee } from "@/types/employee";

interface EmployeeFormWrapperProps {
  employee: Employee;
  isLoading: boolean;
  isSaving: boolean;
  isEditMode: boolean;
  handleFormSubmit: (formData: Partial<Employee>) => Promise<void>;
}

export const EmployeeFormWrapper: React.FC<EmployeeFormWrapperProps> = ({
  employee,
  isLoading,
  isSaving,
  isEditMode,
  handleFormSubmit
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>(employee || {});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };
  
  const handleSubmit = () => {
    handleFormSubmit(formData);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-8">
          <PersonalInfo
            formData={formData}
            handleChange={handleFormChange}
            handleFileChange={handleFileChange}
            selectedFile={selectedFile}
          />
          
          <RoleInfo
            formData={formData}
            handleChange={handleFormChange}
          />
          
          <StatusInfo
            formData={formData}
            handleChange={handleFormChange}
          />
          
          <FormActions
            isEditMode={isEditMode}
            isSaving={isSaving}
            onSave={handleSubmit}
          />
        </div>
      </CardContent>
    </Card>
  );
};
