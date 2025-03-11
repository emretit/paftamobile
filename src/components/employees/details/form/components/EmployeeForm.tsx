
import React from "react";
import type { Employee } from "../../../types";
import { FormFields } from "../FormFields";

interface EmployeeFormProps {
  formData: Partial<Employee>;
  departments: { name: string }[];
  handleInputChange: (field: string, value: string) => void;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
}

export const EmployeeForm = ({ 
  formData, 
  departments, 
  handleInputChange,
  onSubmit
}: EmployeeFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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
