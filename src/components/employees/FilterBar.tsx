
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Table, LayoutGrid, Filter, X } from "lucide-react";
import type { ViewMode } from "./types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const clearFilters = () => {
    onDepartmentChange([]);
    onSearchChange("");
  };

  const hasActiveFilters = selectedDepartments.length > 0 || searchQuery.length > 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            size="icon"
            title="Table View"
            className="w-9 h-9"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            size="icon"
            title="Grid View"
            className="w-9 h-9"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>

          <Button onClick={() => navigate('/employees/new')} className="hidden sm:flex items-center gap-2 whitespace-nowrap bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4" />
            New Employee
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-2">
            {DEPARTMENTS.map((department) => (
              <Button
                key={department}
                variant={selectedDepartments.includes(department) ? "default" : "outline"}
                size="sm"
                onClick={() => handleDepartmentClick(department)}
                className={`whitespace-nowrap ${
                  selectedDepartments.includes(department)
                    ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                    : 'hover:bg-gray-50'
                }`}
              >
                {department}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <Button
          onClick={() => navigate('/employees/new')}
          className="w-full sm:hidden flex items-center gap-2 justify-center bg-primary hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4" />
          New Employee
        </Button>
      </div>
    </div>
  );
};
