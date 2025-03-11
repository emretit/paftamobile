
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { EmployeeList } from "@/components/employees/EmployeeList";

interface EmployeesPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Employees = ({ isCollapsed, setIsCollapsed }: EmployeesPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <EmployeeList />
        </div>
      </main>
    </div>
  );
};

export default Employees;
