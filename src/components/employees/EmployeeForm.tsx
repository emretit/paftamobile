
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PersonalInfo } from "./form/PersonalInfo";
import { RoleInfo } from "./form/RoleInfo";
import { StatusInfo } from "./form/StatusInfo";
import { ImageUpload } from "./form/ImageUpload";
import { useEmployeeDepartments } from "./form/useEmployeeDepartments";
import { useImageUpload } from "./form/useImageUpload";
import { useFormValidation } from "./form/useFormValidation";
import { initialFormData, type EmployeeFormData } from "./form/types";
import type { Employee } from "./types";

interface EmployeeFormProps {
  initialData?: Employee;
}

export const EmployeeForm = ({ initialData }: EmployeeFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const departments = useEmployeeDepartments();
  const { selectedFile, handleFileChange, uploadAvatar } = useImageUpload();
  const { validateForm } = useFormValidation();
  
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData || initialFormData
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

      const employeeData = {
        ...formData,
        avatar_url: avatarUrl,
      };

      if (initialData) {
        // Update existing employee
        const { error } = await supabase
          .from('employees')
          .update({
            ...employeeData,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialData.id);

        if (error) throw error;

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

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {initialData ? 'Edit Employee' : 'Add New Employee'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfo
            formData={formData}
            onFormChange={handleFormChange}
            errors={formErrors}
            isEditMode={!!initialData}
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

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(id ? `/employees/${id}` : "/employees")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (initialData ? "Update" : "Add Employee")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
