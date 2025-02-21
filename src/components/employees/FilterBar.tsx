
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Table, LayoutGrid } from "lucide-react";
import type { ViewMode } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDepartments: string[];
  onDepartmentChange: (departments: string[]) => void;
}

const DEPARTMENTS = ['Teknik', 'Satış', 'Finans', 'İnsan Kaynakları', 'Müşteri Desteği'];
const STATUSES = ['Aktif', 'Pasif'];

export const FilterBar = ({ 
  viewMode, 
  setViewMode, 
  searchQuery, 
  onSearchChange,
  selectedDepartments,
  onDepartmentChange
}: FilterBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            size="icon"
            title="Tablo Görünümü"
            className="w-9 h-9"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            size="icon"
            title="Kart Görünümü"
            className="w-9 h-9"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 items-center gap-4 max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Çalışan ara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Departman seç" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum seç" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => navigate('/employees/new')} className="hidden sm:flex items-center gap-2 whitespace-nowrap">
            <UserPlus className="h-4 w-4" />
            Yeni Çalışan
          </Button>
        </div>
      </div>
      
      <Button
        onClick={() => navigate('/employees/new')}
        className="w-full sm:hidden flex items-center gap-2 justify-center mt-4"
      >
        <UserPlus className="h-4 w-4" />
        Yeni Çalışan
      </Button>
    </div>
  );
};
