
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { PersonalInfo } from "./form/PersonalInfo";
import { RoleInfo } from "./form/RoleInfo";
import { StatusInfo } from "./form/StatusInfo";
import { ImageUpload } from "./form/ImageUpload";
import { useEmployeeDepartments } from "./form/useEmployeeDepartments";
import { useImageUpload } from "./form/useImageUpload";
import { useFormValidation } from "./form/useFormValidation";
import { initialFormData, type EmployeeFormData } from "./form/types";

export const EmployeeForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const departments = useEmployeeDepartments();
  const { selectedFile, handleFileChange, uploadAvatar } = useImageUpload();
  const { validateEmail, validatePhoneNumber } = useFormValidation();
  
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateEmail(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      let avatarUrl = null;
      if (selectedFile) {
        avatarUrl = await uploadAvatar(selectedFile);
      }

      const employeeData = {
        ...formData,
        avatar_url: avatarUrl,
      };

      const { error } = await supabase
        .from('employees')
        .insert([employeeData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee added successfully",
      });
      
      navigate("/employees");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/employees")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Employee</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfo
            formData={formData}
            onFormChange={handleFormChange}
          />

          <RoleInfo
            formData={formData}
            departments={departments}
            onFormChange={handleFormChange}
          />

          <StatusInfo
            formData={formData}
            onFormChange={handleFormChange}
          />

          <ImageUpload
            onFileChange={handleFileChange}
            selectedFile={selectedFile}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/employees")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
