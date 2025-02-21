
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import type { ViewMode } from "./types";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface FilterBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const FilterBar = ({ viewMode, setViewMode }: FilterBarProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useRoleCheck();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="space-x-2">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          onClick={() => setViewMode('table')}
        >
          Table View
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          onClick={() => setViewMode('grid')}
        >
          Grid View
        </Button>
      </div>

      {isAdmin && (
        <Button onClick={() => navigate('/employees/new')} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          New Employee
        </Button>
      )}
    </div>
  );
};
