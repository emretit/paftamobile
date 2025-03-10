
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export const FilterBar = ({ 
  searchQuery, 
  setSearchQuery,
  statusFilter,
  setStatusFilter
}: FilterBarProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Çalışan ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
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
