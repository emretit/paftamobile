
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useFormValidation } from "./useFormValidation";
import { useImageUpload } from "./useImageUpload";
import { initialFormData, type EmployeeFormData } from "./types";
import type { Employee } from "../types";

export const useEmployeeForm = (initialData?: Employee) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateForm } = useFormValidation();
  const { selectedFile, handleFileChange, uploadAvatar } = useImageUpload();
  
  // Map employee data to form data format
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
  
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData ? mapEmployeeToFormData(initialData) : initialFormData
  );
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check auth session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to perform this action",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleFormChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is edited
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
    console.log("Submitting form data:", formData);

    // Validate form
    const { isValid, errors } = validateForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      setIsLoading(false);
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      let avatarUrl = formData.avatar_url;
      if (selectedFile) {
        avatarUrl = await uploadAvatar(selectedFile);
      }

      // Ensure status is either 'active' or 'inactive'
      const status = formData.status === 'active' ? 'active' : 'inactive';

      const employeeData = {
        ...formData,
        status: status,
        avatar_url: avatarUrl,
      };

      console.log("Prepared employee data:", employeeData);

      if (initialData) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update({
            ...employeeData,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialData.id);

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Employee information updated successfully",
        });
        
        // Navigate to employee details after update
        navigate(`/employees/${initialData.id}`);
      } else {
        // Add new employee
        const { data, error } = await supabase
          .from('employees')
          .insert([{
            ...employeeData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (error) {
          if (error.code === '23505') {
            toast({
              title: "Error",
              description: "An employee with this email already exists",
              variant: "destructive",
            });
            setFormErrors(prev => ({ ...prev, email: "This email is already in use" }));
            setIsLoading(false);
            return;
          }
          console.error("Supabase insert error:", error);
          throw error;
        }

        toast({
          title: "Success",
          description: "New employee added successfully",
        });
        
        // Navigate to employee list or details if available
        if (data && data[0]?.id) {
          navigate(`/employees/${data[0].id}`);
        } else {
          navigate("/employees");
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: initialData 
          ? "Failed to update employee"
          : "Failed to add employee",
        variant: "destructive",
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
