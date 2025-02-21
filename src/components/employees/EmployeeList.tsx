
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FilterBar } from "./FilterBar";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeGrid } from "./EmployeeGrid";
import type { Employee } from "./types";
import { useToast } from "@/components/ui/use-toast";

// Type guard to check if status is valid
const isValidStatus = (status: string): status is Employee['status'] => {
  return ['active', 'inactive'].includes(status);
};

// Function to transform database row to Employee type
const transformToEmployee = (row: any): Employee => {
  if (!isValidStatus(row.status)) {
    // Default to 'active' if status is invalid
    console.warn(`Invalid status: ${row.status}, defaulting to 'active'`);
    row.status = 'active';
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
        // Simplify the query to avoid DataCloneError
        const { data, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name, email, phone, position, department, hire_date, status, avatar_url');

        if (error) {
          toast({
            title: "Hata",
            description: "Çalışan listesi alınamadı.",
            variant: "destructive",
          });
          console.error('Error fetching employees:', error);
          return;
        }

        console.log('Fetched employees:', data); // Debug log
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

    // Set up realtime subscription
    const channel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        async (payload) => {
          console.log('Realtime update received:', payload);
          
          // Refetch the entire list to ensure consistency
          const { data: updatedData } = await supabase
            .from('employees')
            .select('id, first_name, last_name, email, phone, position, department, hire_date, status, avatar_url');
            
          if (updatedData) {
            const transformedEmployees = updatedData.map(transformToEmployee);
            setEmployees(transformedEmployees);
            
            // Show notification for changes
            let message = '';
            switch (payload.eventType) {
              case 'INSERT':
                message = 'New employee added';
                break;
              case 'UPDATE':
                message = 'Employee information updated';
                break;
              case 'DELETE':
                message = 'Employee removed';
                break;
            }
            
            toast({
              title: "Update",
              description: message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
