
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FilterBar } from "./FilterBar";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeGrid } from "./EmployeeGrid";
import type { Employee } from "./types";
import { useToast } from "@/components/ui/use-toast";

// Type guard to check if status is valid
const isValidStatus = (status: string): status is Employee['status'] => {
  return ['aktif', 'pasif', 'izinli', 'ayrıldı'].includes(status);
};

// Function to transform database row to Employee type
const transformToEmployee = (row: any): Employee => {
  if (!isValidStatus(row.status)) {
    // Default to 'aktif' if status is invalid
    console.warn(`Invalid status: ${row.status}, defaulting to 'aktif'`);
    row.status = 'aktif';
  }
  
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    position: row.position,
    department: row.department,
    hire_date: row.hire_date,
    status: row.status,
    avatar_url: row.avatar_url
  };
};

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

        // Transform the data to match Employee type
        const transformedEmployees = (data || []).map(transformToEmployee);
        setEmployees(transformedEmployees);
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
