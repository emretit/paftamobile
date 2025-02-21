
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, Table, LayoutGrid } from "lucide-react";
import type { ViewMode } from "./types";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Input } from "@/components/ui/input";

interface FilterBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FilterBar = ({ viewMode, setViewMode, searchQuery, onSearchChange }: FilterBarProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useRoleCheck();

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
        
        {isAdmin && (
          <Button onClick={() => navigate('/employees/new')} className="flex items-center gap-2 whitespace-nowrap">
            <UserPlus className="h-4 w-4" />
            New Employee
          </Button>
        )}
      </div>
    </div>
  );
};
