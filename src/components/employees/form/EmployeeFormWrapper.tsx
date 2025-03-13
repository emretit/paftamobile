
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalInfo } from "./PersonalInfo";
import { RoleInfo } from "./RoleInfo";
import { FormActions } from "./FormActions";
import { StatusInfo } from "./StatusInfo";
import { Employee, EmployeeFormData } from "@/types/employee";

interface EmployeeFormWrapperProps {
  employee: Employee;
  isLoading: boolean;
  isSaving: boolean;
  isEditMode: boolean;
  handleFormSubmit: (formData: Partial<Employee>) => Promise<void>;
  onSuccess?: () => void;
}

export const EmployeeFormWrapper: React.FC<EmployeeFormWrapperProps> = ({
  employee,
  isLoading,
  isSaving,
  isEditMode,
  handleFormSubmit,
  onSuccess
}) => {
  // Convert Employee to EmployeeFormData to ensure required fields are present
  const initialFormData: EmployeeFormData = {
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone || "",
    position: employee.position,
    department: employee.department,
    hire_date: employee.hire_date,
    status: employee.status,
    avatar_url: employee.avatar_url || "",
    date_of_birth: employee.date_of_birth || "",
    gender: employee.gender || null,
    marital_status: employee.marital_status || null,
    address: employee.address || "",
    country: employee.country || "",
    city: employee.city || "",
    district: employee.district || "",
    postal_code: employee.postal_code || "",
    id_ssn: employee.id_ssn || "",
    emergency_contact_name: employee.emergency_contact_name || "",
    emergency_contact_phone: employee.emergency_contact_phone || "",
    emergency_contact_relation: employee.emergency_contact_relation || ""
  };
  
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };
  
  const handleSubmit = async () => {
    // Convert EmployeeFormData back to Partial<Employee> for submission
    const employeeData: Partial<Employee> = {
      ...formData
    };
    
    await handleFormSubmit(employeeData);
    if (onSuccess) onSuccess();
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
