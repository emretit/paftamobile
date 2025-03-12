
import { useState } from "react";
import { useEmployeeData } from "./hooks/useEmployeeData";
import { EmployeeActions } from "./components/EmployeeActions";
import { EmployeeListContent } from "./components/EmployeeListContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import type { ViewMode } from "@/types/employee";

export const EmployeeList = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState("");
  const { employees, isLoading, fetchEmployees } = useEmployeeData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Çalışan Listesi</h2>
        <EmployeeActions
          viewMode={viewMode}
          setViewMode={setViewMode}
          onRefresh={fetchEmployees}
          hasEmployees={employees.length > 0}
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Çalışan ara..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Tümü</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Tüm Departmanlar</span>
          </Button>
        </div>
      </div>

      <EmployeeListContent
        employees={employees.filter(emp => 
          `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.position.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        isLoading={isLoading}
        viewMode={viewMode}
      />
    </div>
  );
};
