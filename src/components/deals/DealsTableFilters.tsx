
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { FilterState } from "./types";
import { Deal } from "@/types/deal";

interface DealsTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const DealsTableFilters = ({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
}: DealsTableFiltersProps) => {
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.customer) count++;
    if (filters.employee) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.valueRange.min || filters.valueRange.max) count++;
    return count;
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      customer: '',
      employee: '',
      dateRange: {
        from: undefined,
        to: undefined,
      },
      valueRange: {
        min: '',
        max: '',
      },
    });
  };

  return (
    <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
      <Input
        placeholder="Fırsat adı, müşteri veya temsilci ara..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:w-64"
      />
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-10">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtreler
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
              <Label>Durum</Label>
              <Select
                value={filters.status}
                onValueChange={(value: Deal['status'] | 'all') => 
                  onFiltersChange({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tüm durumlar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="new">Yeni Teklif</SelectItem>
                  <SelectItem value="negotiation">Görüşmede</SelectItem>
                  <SelectItem value="follow_up">Takipte</SelectItem>
                  <SelectItem value="won">Kazanıldı</SelectItem>
                  <SelectItem value="lost">Kaybedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Müşteri</Label>
              <Input
                placeholder="Müşteri adı"
                value={filters.customer}
                onChange={(e) => onFiltersChange({ ...filters, customer: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Satış Temsilcisi</Label>
              <Input
                placeholder="Temsilci adı"
                value={filters.employee}
                onChange={(e) => onFiltersChange({ ...filters, employee: e.target.value })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Teklif Tarihi Aralığı</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, 'dd.MM.yyyy')
                      ) : (
                        "Başlangıç"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => 
                        onFiltersChange({
                          ...filters,
                          dateRange: { ...filters.dateRange, from: date }
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, 'dd.MM.yyyy')
                      ) : (
                        "Bitiş"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => 
                        onFiltersChange({
                          ...filters,
                          dateRange: { ...filters.dateRange, to: date }
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tahmini Tutar Aralığı</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.valueRange.min}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    valueRange: { ...filters.valueRange, min: e.target.value }
                  })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.valueRange.max}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    valueRange: { ...filters.valueRange, max: e.target.value }
                  })}
                />
              </div>
            </div>

            <Separator />

            <Button 
              variant="outline" 
              className="w-full"
              onClick={clearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Filtreleri Temizle
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DealsTableFilters;
