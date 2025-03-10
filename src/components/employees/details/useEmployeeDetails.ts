
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "../types";

export const useEmployeeDetails = (id?: string) => {
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

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

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    setEmployee(updatedEmployee);
    toast({
      title: "Başarılı",
      description: "Çalışan bilgileri başarıyla güncellendi.",
    });
  };

  return {
    employee,
    isLoading,
    activeTab,
    setActiveTab,
    handleEmployeeUpdate
  };
};
