
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
}

export const FilterBar = ({ 
  searchQuery, 
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter
}: FilterBarProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 max-w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Çalışan ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="min-w-[180px]">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Durum seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="pasif">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[180px]">
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-full gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Departman seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Departmanlar</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="HR">İnsan Kaynakları</SelectItem>
                <SelectItem value="Finance">Finans</SelectItem>
                <SelectItem value="Marketing">Pazarlama</SelectItem>
                <SelectItem value="Sales">Satış</SelectItem>
                <SelectItem value="Operations">Operasyon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
