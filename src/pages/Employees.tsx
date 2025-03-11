
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { FilterBar } from "@/components/employees/FilterBar";
import type { ViewMode } from "@/types/employee";

interface EmployeesPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Employees = ({ isCollapsed, setIsCollapsed }: EmployeesPageProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <FilterBar
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
          
          <EmployeeList
            viewMode={viewMode}
            searchQuery={searchQuery}
            selectedDepartment={selectedDepartment}
            selectedStatus={selectedStatus}
          />
        </div>
      </main>
    </div>
  );
};

export default Employees;
