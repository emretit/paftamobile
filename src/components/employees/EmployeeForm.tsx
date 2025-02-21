
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { toast } = useToast();
  const departments = useEmployeeDepartments();
  const { selectedFile, handleFileChange, uploadAvatar } = useImageUpload();
  const { validateEmail, validatePhoneNumber } = useFormValidation();
  
  const [formData, setFormData] = useState<EmployeeFormData>(
    initialData || initialFormData
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleFormChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateEmail(formData.email)) {
      toast({
        title: "Hata",
        description: "Geçerli bir e-posta adresi giriniz",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      toast({
        title: "Hata",
        description: "Geçerli bir telefon numarası giriniz",
        variant: "destructive",
      });
      setIsLoading(false);
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
          .update(employeeData)
          .eq('id', initialData.id);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Çalışan bilgileri güncellendi",
        });
      } else {
        // Add new employee
        const { error } = await supabase
          .from('employees')
          .insert([employeeData]);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Çalışan eklendi",
        });
      }
      
      navigate("/employees");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Hata",
        description: initialData 
          ? "Çalışan güncellenirken bir hata oluştu"
          : "Çalışan eklenirken bir hata oluştu",
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
          {initialData ? 'Çalışan Düzenle' : 'Yeni Çalışan Ekle'}
        </h1>

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
              onClick={() => navigate(initialData ? `/employees/details/${initialData.id}` : "/employees")}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : (initialData ? "Güncelle" : "Ekle")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
