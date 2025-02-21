
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ViewMode } from "./EmployeeList";
import { UserPlus } from "lucide-react";

interface FilterBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const FilterBar = ({ viewMode, setViewMode }: FilterBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="space-x-2">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          onClick={() => setViewMode('table')}
        >
          Tablo Görünümü
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          onClick={() => setViewMode('grid')}
        >
          Kart Görünümü
        </Button>
      </div>

      <Button onClick={() => navigate('/employees/new')} className="flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        Yeni Çalışan
      </Button>
    </div>
  );
};
