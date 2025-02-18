
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ProposalFiltersProps {
  onFilterChange: (filters: ProposalFilters) => void;
}

export interface ProposalFilters {
  search: string;
  status: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  amountRange: {
    min: number | null;
    max: number | null;
  };
  employeeId: string | null;
}

export const ProposalFilters = ({ onFilterChange }: ProposalFiltersProps) => {
  const [filters, setFilters] = useState<ProposalFilters>({
    search: "",
    status: "all", // Changed default value to "all" instead of empty string
    dateRange: {
      from: null,
      to: null,
    },
    amountRange: {
      min: null,
      max: null,
    },
    employeeId: null,
  });

  const handleFilterChange = (key: keyof ProposalFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Teklif ara (Teklif no, müşteri adı, temsilci)"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="new">Yeni</SelectItem>
            <SelectItem value="review">İncelemede</SelectItem>
            <SelectItem value="negotiation">Görüşmede</SelectItem>
            <SelectItem value="accepted">Kabul Edildi</SelectItem>
            <SelectItem value="rejected">Reddedildi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label>Tarih Aralığı</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "dd MMM yyyy", { locale: tr })
                  ) : (
                    "Başlangıç"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from || undefined}
                  onSelect={(date) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      from: date,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "dd MMM yyyy", { locale: tr })
                  ) : (
                    "Bitiş"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to || undefined}
                  onSelect={(date) =>
                    handleFilterChange("dateRange", {
                      ...filters.dateRange,
                      to: date,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <Label>Tutar Aralığı (TL)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.amountRange.min || ""}
              onChange={(e) =>
                handleFilterChange("amountRange", {
                  ...filters.amountRange,
                  min: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.amountRange.max || ""}
              onChange={(e) =>
                handleFilterChange("amountRange", {
                  ...filters.amountRange,
                  max: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
