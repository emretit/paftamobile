
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
      
      // Map status values from database to ensure consistency
      const statusValue: 'active' | 'inactive' = 
        (data.status === 'active' || data.status === 'aktif' || data.status === 'izinli') 
          ? 'active' 
          : 'inactive';
      
      // Convert data to Employee type
      const employeeData: Employee = {
        ...data,
        status: statusValue
      };
      
      console.log("Fetched employee data:", employeeData);
      setEmployee(employeeData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load employee details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleEmployeeUpdate = (updatedEmployee: Employee) => {
    console.log("Handling employee update:", updatedEmployee);
    setEmployee(updatedEmployee);
    toast({
      title: "Success",
      description: "Employee information updated successfully.",
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
