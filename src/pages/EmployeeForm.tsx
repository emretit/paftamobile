
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { EditableEmployeeDetails } from "@/components/employees/details/form/EditableEmployeeDetails";
import { Employee } from "@/types/employee";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface EmployeeFormProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const EmployeeForm = ({ isCollapsed, setIsCollapsed }: EmployeeFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEmployee(data as Employee);
      } catch (error) {
        console.error('Error fetching employee:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employee details",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id, toast]);

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Employee updated successfully",
    });
    navigate(`/employees/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate(`/employees/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employee Details
          </Button>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ) : employee ? (
            <EditableEmployeeDetails 
              employee={employee}
              onCancel={() => navigate(`/employees/${id}`)}
              onSuccess={handleSuccess}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold text-gray-700">Employee Not Found</h2>
                <p className="text-gray-500 mt-2">The employee you're looking for doesn't exist or has been removed.</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/employees')}
                >
                  Back to Employees
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeForm;
