
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FilterBar } from "./FilterBar";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeGrid } from "./EmployeeGrid";
import type { Employee } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { useDebounce } from "@/hooks/useDebounce";

// Type guard to check if status is valid
const isValidStatus = (status: string): status is Employee['status'] => {
  return ['active', 'inactive'].includes(status);
};

// Function to transform database row to Employee type
const transformToEmployee = (row: any): Employee => {
  if (!isValidStatus(row.status)) {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { toast } = useToast();

  const fetchEmployees = async (search?: string) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('employees')
        .select('id, first_name, last_name, email, phone, position, department, hire_date, status, avatar_url');

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%,position.ilike.%${search}%`);
      }

      if (selectedDepartments.length > 0) {
        query = query.in('department', selectedDepartments);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch employees",
          variant: "destructive",
        });
        console.error('Error fetching employees:', error);
        return;
      }

      const transformedEmployees = (data || []).map(transformToEmployee);
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect for search and department filters
  useEffect(() => {
    fetchEmployees(debouncedSearch);
  }, [debouncedSearch, selectedDepartments]);

  // Effect for realtime updates
  useEffect(() => {
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
          await fetchEmployees(debouncedSearch);
          
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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debouncedSearch, selectedDepartments, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <FilterBar 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDepartments={selectedDepartments}
        onDepartmentChange={setSelectedDepartments}
      />
      {viewMode === 'table' ? (
        <EmployeeTable employees={employees} />
      ) : (
        <EmployeeGrid employees={employees} />
      )}
    </>
  );
};
