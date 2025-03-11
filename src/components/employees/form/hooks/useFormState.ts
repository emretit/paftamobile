
import { useState } from "react";
import type { Employee, EmployeeFormData } from "../types";

export const useFormState = (initialData?: Employee, onSuccess?: () => void) => {
  const [formData, setFormData] = useState<EmployeeFormData>(initialData || {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    hire_date: new Date().toISOString().split('T')[0],
    status: "active"
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleFormChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return {
    formData,
    formErrors,
    setFormErrors,
    handleFormChange
  };
};
