
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useFormValidation } from "./useFormValidation";
import { useImageUpload } from "./useImageUpload";
import { initialFormData, type EmployeeFormData } from "./types";
import type { Employee } from "../types";

// Helper function to map Employee to form data
const mapEmployeeToFormData = (employee: Employee): EmployeeFormData => {
  return {
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone || '',
    position: employee.position,
    department: employee.department,
    hire_date: employee.hire_date,
    status: employee.status === 'active' ? 'active' : 'inactive',
    avatar_url: employee.avatar_url || '',
    date_of_birth: employee.date_of_birth || '',
    gender: employee.gender || '',
    marital_status: employee.marital_status || '',
    address: employee.address || '',
    country: employee.country || '',
    city: employee.city || '',
    district: employee.district || '',
    postal_code: employee.postal_code || '',
    id_ssn: employee.id_ssn || '',
    emergency_contact_name: employee.emergency_contact_name || '',
    emergency_contact_phone: employee.emergency_contact_phone || '',
    emergency_contact_relation: employee.emergency_contact_relation || '',
  };
};

export const useEmployeeForm = (initialData?: Employee, onSuccess?: () => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateForm } = useFormValidation();
  const { selectedFile, handleFileChange, uploadAvatar } = useImageUpload();
  
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData ? mapEmployeeToFormData(initialData) : initialFormData
  );
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form
      const { isValid, errors } = validateForm(formData);
      if (!isValid) {
        setFormErrors(errors);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please check the form fields.",
        });
        return;
      }

      let avatarUrl = formData.avatar_url;
      if (selectedFile) {
        avatarUrl = await uploadAvatar(selectedFile);
      }

      // Prepare employee data
      const employeeData = {
        ...formData,
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert into Supabase
      const { error } = await supabase
        .from('employees')
        .insert([employeeData]);

      if (error) throw error;

      // Show success message and navigate
      toast({
        title: "Success",
        description: "Employee added successfully.",
      });
      
      // Either call the custom success handler or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/employees");
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add employee.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    formErrors,
    isLoading,
    handleFormChange,
    handleSubmit,
    handleFileChange,
    selectedFile,
    isEditMode: !!initialData
  };
};
