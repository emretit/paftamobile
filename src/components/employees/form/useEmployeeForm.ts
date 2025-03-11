
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
          title: "Hata",
          description: "Lütfen form alanlarını kontrol edin.",
        });
        return;
      }

      let avatarUrl = formData.avatar_url;
      if (selectedFile) {
        avatarUrl = await uploadAvatar(selectedFile);
      }

      // Prepare employee data
      const employeeData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        position: formData.position,
        department: formData.department,
        hire_date: formData.hire_date,
        status: formData.status,
        avatar_url: avatarUrl || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        address: formData.address || null,
        country: formData.country || null,
        city: formData.city || null,
        district: formData.district || null,
        postal_code: formData.postal_code || null,
        id_ssn: formData.id_ssn || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relation: formData.emergency_contact_relation || null
      };

      console.log("Gönderilen çalışan verisi:", employeeData);

      // Insert into Supabase
      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log("Başarılı yanıt:", data);

      // Show success message and navigate
      toast({
        title: "Başarılı",
        description: "Çalışan başarıyla eklendi.",
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
        title: "Hata",
        description: "Çalışan eklenirken bir hata oluştu.",
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
