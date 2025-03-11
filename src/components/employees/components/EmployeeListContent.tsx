
import { useState } from "react";
import EmployeeTable from "../EmployeeTable";
import { EmployeeGrid } from "../EmployeeGrid";
import { FilterBar } from "../FilterBar";
import type { Employee, ViewMode } from "../types";

interface EmployeeListContentProps {
  employees: Employee[];
  isLoading: boolean;
  viewMode: ViewMode;
}

export const EmployeeListContent = ({
  employees,
  isLoading,
  viewMode
}: EmployeeListContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      searchQuery === '' || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      employee.status === statusFilter;
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      employee.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <>
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
      />

      {viewMode === 'table' ? (
        <EmployeeTable 
          employees={filteredEmployees} 
          isLoading={isLoading} 
        />
      ) : (
        <EmployeeGrid 
          employees={filteredEmployees} 
          isLoading={isLoading} 
        />
      )}
    </>
  );
};
