
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FilterBar } from "./FilterBar";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeGrid } from "./EmployeeGrid";
import type { Employee } from "./types";

export const EmployeeList = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }

      setEmployees(data as Employee[]);
    };

    fetchEmployees();
  }, []);

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
