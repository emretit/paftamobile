
import Navbar from "@/components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/components/employees/types";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

interface EmployeeEditPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const EmployeeEdit = ({ isCollapsed, setIsCollapsed }: EmployeeEditPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Veriyi Employee tipine dönüştür
        const employeeData: Employee = {
          ...data,
          status: data.status === 'active' ? 'active' : 'inactive'
        };
        
        setEmployee(employeeData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Çalışan bilgileri yüklenirken bir hata oluştu.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id, toast]);

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!employee) {
    return <div>Çalışan bulunamadı.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => navigate(`/employees/details/${id}`)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </button>
          </div>
          <EmployeeForm initialData={employee} />
        </div>
      </main>
    </div>
  );
};

export default EmployeeEdit;
