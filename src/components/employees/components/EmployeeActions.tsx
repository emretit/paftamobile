
import { RefreshCw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewModeToggle } from "./ViewModeToggle";
import { useNavigate } from "react-router-dom";
import type { ViewMode } from "@/types/employee";

interface EmployeeActionsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onRefresh: () => void;
  onClearAll: () => void;
  hasEmployees: boolean;
  isLoading: boolean;
}

export const EmployeeActions = ({
  viewMode,
  setViewMode,
  onRefresh,
  onClearAll,
  hasEmployees,
  isLoading
}: EmployeeActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>

      <Button 
        variant="default" 
        onClick={() => navigate('/employee-form')}
        className="gap-1"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Yeni Çalışan</span>
      </Button>

      {hasEmployees && (
        <Button
          variant="destructive"
          size="icon"
          onClick={onClearAll}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
