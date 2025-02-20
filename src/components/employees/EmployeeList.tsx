
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FilterBar } from "./FilterBar";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeGrid } from "./EmployeeGrid";
import type { Employee } from "./types";
import { useToast } from "@/components/ui/use-toast";

export const EmployeeList = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select()
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            title: "Hata",
            description: "Çalışan listesi alınamadı.",
            variant: "destructive",
          });
          console.error('Error fetching employees:', error);
          return;
        }

        setEmployees(data || []);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Hata",
          description: "Bir hata oluştu.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <FilterBar viewMode={viewMode} setViewMode={setViewMode} />
      {viewMode === 'table' ? (
        <EmployeeTable employees={employees} />
      ) : (
        <EmployeeGrid employees={employees} />
      )}
    </>
  );
};
