
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Employee } from "@/types/employee";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

export const useEmployeeData = () => {
  const { toast } = useToast();

  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data as Employee[];
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Çalışan bilgileri yüklenirken bir hata oluştu.",
        });
        return [];
      }
    },
  });

  const handleClearEmployees = async () => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (error) throw error;
      
      toast({
        title: "Başarılı",
        description: "Tüm çalışan bilgileri silindi.",
      });
      
      refetch();
    } catch (error) {
      console.error('Error clearing employees:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Çalışan bilgileri silinirken bir hata oluştu.",
      });
    }
  };

  return {
    employees,
    isLoading,
    refetch,
    handleClearEmployees
  };
};
