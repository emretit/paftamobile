
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Search, Table, LayoutGrid, Filter, X } from "lucide-react";
import type { ViewMode } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDepartments: string[];
  onDepartmentChange: (departments: string[]) => void;
}

const DEPARTMENTS = ['Technical', 'Sales', 'Finance', 'Human Resources', 'Customer Support'];
const STATUSES = ['Active', 'Inactive'];

export const FilterBar = ({ 
  viewMode, 
  setViewMode, 
  searchQuery, 
  onSearchChange,
  selectedDepartments,
  onDepartmentChange
}: FilterBarProps) => {
  const navigate = useNavigate();

  const clearFilters = () => {
    onDepartmentChange([]);
    onSearchChange("");
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedDepartments.length > 0) count++;
    return count;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
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

        <div className="flex flex-1 items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={selectedDepartments[0] || ""}
                    onValueChange={(value) => {
                      if (value) {
                        onDepartmentChange([value]);
                      } else {
                        onDepartmentChange([]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status.toLowerCase()}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={() => navigate('/employees/new')} className="hidden sm:flex items-center gap-2 whitespace-nowrap">
            <UserPlus className="h-4 w-4" />
            New Employee
          </Button>
        </div>
      </div>
      
      <Button
        onClick={() => navigate('/employees/new')}
        className="w-full sm:hidden flex items-center gap-2 justify-center mt-4"
      >
        <UserPlus className="h-4 w-4" />
        New Employee
      </Button>
    </div>
  );
};
