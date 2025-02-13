
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle, LayoutGrid, Table as TableIcon } from "lucide-react";

interface FilterBarProps {
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
}

export const FilterBar = ({ viewMode, setViewMode }: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Ad, e-posta veya telefon ile ara..."
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Departman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Departmanlar</SelectItem>
            <SelectItem value="sales">Satış</SelectItem>
            <SelectItem value="tech">Teknik Destek</SelectItem>
            <SelectItem value="finance">Muhasebe</SelectItem>
            <SelectItem value="logistics">Lojistik</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="izinli">İzinli</SelectItem>
            <SelectItem value="pasif">Pasif</SelectItem>
            <SelectItem value="ayrıldı">Ayrıldı</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <div className="flex rounded-md border">
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('table')}
            className="rounded-r-none"
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="rounded-l-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        <Button>
          <PlusCircle className="h-5 w-5 mr-2" />
          Yeni Çalışan
        </Button>
      </div>
    </div>
  );
};
