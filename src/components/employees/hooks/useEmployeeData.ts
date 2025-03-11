
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/types/employee";
import { useToast } from "@/components/ui/use-toast";

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

      setEmployees(data as Employee[]);
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
            setEmployees(prev => [payload.new as Employee, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setEmployees(prev => 
              prev.map(emp => emp.id === payload.new.id ? payload.new as Employee : emp)
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
