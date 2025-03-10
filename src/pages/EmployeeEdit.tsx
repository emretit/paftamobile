
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/components/employees/types";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { Skeleton } from "@/components/ui/skeleton";

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
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Convert data to Employee type
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => navigate("/employees")}
              variant="ghost"
              className="flex items-center text-gray-600 hover:text-gray-900 p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Çalışanlara Dön
            </Button>
            
            {!isLoading && employee && (
              <Button
                onClick={() => navigate(`/employees/${id}`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Çalışana Git
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !employee ? (
            <div className="p-4 text-center bg-white rounded-md shadow">
              <h2 className="text-xl font-medium text-gray-800">Çalışan bulunamadı</h2>
              <p className="mt-2 text-gray-600">İstediğiniz çalışan kaydı mevcut değil veya erişim izniniz yok.</p>
              <Button className="mt-4" onClick={() => navigate("/employees")}>
                Çalışanlara Dön
              </Button>
            </div>
          ) : (
            <EmployeeForm initialData={employee} />
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeEdit;
