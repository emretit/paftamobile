
import { useState } from "react";
import { useEmployeeData } from "./hooks/useEmployeeData";
import { EmployeeActions } from "./components/EmployeeActions";
import { EmployeeListContent } from "./components/EmployeeListContent";
import type { ViewMode } from "@/types/employee";

export const EmployeeList = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const { employees, isLoading, fetchEmployees, handleClearEmployees } = useEmployeeData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Çalışan Listesi</h2>
        <EmployeeActions
          viewMode={viewMode}
          setViewMode={setViewMode}
          onRefresh={fetchEmployees}
          onClearAll={handleClearEmployees}
          hasEmployees={employees.length > 0}
          isLoading={isLoading}
        />
      </div>

      <EmployeeListContent
        employees={employees}
        isLoading={isLoading}
        viewMode={viewMode}
      />
    </div>
  );
};
