
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { ViewModeToggle } from "./ViewModeToggle";
import type { ViewMode } from "../types";

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

  const handleAddEmployee = () => {
    navigate('/employees/new');
  };

  return (
    <div className="flex space-x-2">
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      
      <Button variant="outline" onClick={onRefresh} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Yenile
      </Button>
      
      {hasEmployees && (
        <Button variant="destructive" onClick={onClearAll} disabled={isLoading}>
          Tümünü Sil
        </Button>
      )}
      
      <Button onClick={handleAddEmployee} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Yeni Çalışan
      </Button>
    </div>
  );
};
