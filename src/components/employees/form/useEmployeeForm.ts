
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Employee } from "@/types/employee";

export const useEmployeeForm = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
  }, [id]);

  const fetchEmployee = async (employeeId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (error) throw error;
      setEmployee(data as Employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch employee details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: Partial<Employee>) => {
    setIsSaving(true);
    try {
      if (isEditMode && id) {
        // Update existing employee
        const { error } = await supabase
          .from("employees")
          .update(formData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Employee updated successfully.",
        });
        
        navigate(`/employees/${id}`);
      } else {
        // Create new employee
        const { data, error } = await supabase
          .from("employees")
          .insert([formData])
          .select();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Employee created successfully.",
        });

        if (data && data.length > 0) {
          navigate(`/employees/${data[0].id}`);
        } else {
          navigate("/employees");
        }
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save employee details.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    employee,
    isLoading,
    isSaving,
    isEditMode,
    handleFormSubmit,
  };
};
