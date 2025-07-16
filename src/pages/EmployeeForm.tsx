
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EmployeeEditForm } from "@/components/employees/edit/EmployeeEditForm";
import { Employee } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";

interface EmployeeFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const EmployeeForm = ({ isCollapsed, setIsCollapsed }: EmployeeFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: employee, isLoading, refetch } = useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!id) throw new Error("Çalışan ID'si gerekli");
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Çalışan bulunamadı");
      return data as Employee;
    },
    meta: {
      onError: (error: Error) => {
        toast({
          variant: "destructive",
          title: "Hata",
          description: error.message || "Çalışan detayları yüklenirken hata oluştu",
        });
        navigate("/employees");
      },
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updatedEmployee: Partial<Employee>) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update(updatedEmployee)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Çalışan bilgileri başarıyla güncellendi",
      });

      navigate(`/employees/${id}`);
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan bilgileri güncellenirken bir hata oluştu",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="py-6 px-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(`/employees/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Çalışan Detaylarına Dön
          </Button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">Çalışan Düzenle</h1>
            <p className="text-gray-500">Çalışan bilgilerini güncelle</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Çalışan bilgileri yükleniyor...</p>
              </div>
            </div>
          ) : employee ? (
            <EmployeeEditForm
              employee={employee}
              onSave={handleSave}
              onCancel={() => navigate(`/employees/${id}`)}
              isSaving={isSaving}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600">Çalışan bulunamadı</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeForm;
