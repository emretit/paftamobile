
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "../types";

export const useEmployeeDetails = (id?: string) => {
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

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
      
      // Map status values from database
      let statusValue: 'active' | 'inactive' = 'active';
      if (data.status === 'active' || data.status === 'aktif' || data.status === 'izinli') {
        statusValue = 'active';
      } else if (data.status === 'inactive' || data.status === 'pasif' || data.status === 'ayrıldı') {
        statusValue = 'inactive';
      }
      
      // Convert data to Employee type
      const employeeData: Employee = {
        ...data,
        status: statusValue
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

  useEffect(() => {
    fetchEmployee();
  }, [id, toast]);

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    setEmployee(updatedEmployee);
    toast({
      title: "Başarılı",
      description: "Çalışan bilgileri başarıyla güncellendi.",
    });
    
    // Refresh employee data from the database to ensure we have the latest data
    fetchEmployee();
  };

  return {
    employee,
    isLoading,
    activeTab,
    setActiveTab,
    handleEmployeeUpdate,
    refreshEmployee: fetchEmployee // Export refresh function to manually trigger refresh
  };
};
