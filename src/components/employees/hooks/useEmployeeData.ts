
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "../types";
import { useToast } from "@/components/ui/use-toast";

// Helper function to transform Supabase data to Employee type
const transformToEmployee = (item: any): Employee => {
  let status: 'active' | 'inactive';
  
  if (item.status === 'active') {
    status = 'active';
  } else {
    status = 'inactive';
  }

  return {
    id: item.id,
    first_name: item.first_name,
    last_name: item.last_name,
    email: item.email,
    phone: item.phone || "",
    position: item.position,
    department: item.department,
    hire_date: item.hire_date,
    status: status,
    avatar_url: item.avatar_url
  };
};

export const useEmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      const transformedEmployees = data ? data.map(transformToEmployee) : [];
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan bilgileri yüklenirken bir hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearEmployees = async () => {
    try {
      setIsLoading(true);
      
      // First delete related service requests
      const { error: serviceRequestError } = await supabase
        .from('service_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (serviceRequestError) throw serviceRequestError;

      // Then delete employees
      const { error } = await supabase
        .from('employees')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (error) throw error;

      setEmployees([]);
      
      toast({
        title: "Başarılı",
        description: "Tüm çalışan bilgileri silindi.",
      });
    } catch (error) {
      console.error('Error clearing employees:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan bilgileri silinirken bir hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();

    const channel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEmployee = transformToEmployee(payload.new);
            setEmployees(prev => [newEmployee, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedEmployee = transformToEmployee(payload.new);
            setEmployees(prev => 
              prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
            );
          } else if (payload.eventType === 'DELETE') {
            setEmployees(prev => 
              prev.filter(emp => emp.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    employees,
    isLoading,
    fetchEmployees,
    handleClearEmployees
  };
};
