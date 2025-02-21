
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Table, LayoutGrid } from "lucide-react";
import type { ViewMode } from "./types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDepartments: string[];
  onDepartmentChange: (departments: string[]) => void;
}

const DEPARTMENTS = ['Technical', 'Sales', 'Finance', 'Human Resources', 'Customer Support'];

export const FilterBar = ({ 
  viewMode, 
  setViewMode, 
  searchQuery, 
  onSearchChange,
  selectedDepartments,
  onDepartmentChange
}: FilterBarProps) => {
  const navigate = useNavigate();

  const handleDepartmentClick = (department: string) => {
    if (selectedDepartments.includes(department)) {
      onDepartmentChange(selectedDepartments.filter(d => d !== department));
    } else {
      onDepartmentChange([...selectedDepartments, department]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="w-full sm:w-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            size="icon"
            title="Table View"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            size="icon"
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {DEPARTMENTS.map((department) => (
            <Button
              key={department}
              variant={selectedDepartments.includes(department) ? "default" : "outline"}
              size="sm"
              onClick={() => handleDepartmentClick(department)}
            >
              {department}
            </Button>
          ))}
        </div>
        
        <Button onClick={() => navigate('/employees/new')} className="flex items-center gap-2 whitespace-nowrap">
          <UserPlus className="h-4 w-4" />
          New Employee
        </Button>
      </div>
    </div>
  );
};
