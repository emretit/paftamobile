
import { useState } from "react";
import { Search, Filter, CalendarRange } from "lucide-react";
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
  employeeId: string | null;
  sortBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export const ProposalFilters = ({ onFilterChange }: ProposalFiltersProps) => {
  const [filters, setFilters] = useState<ProposalFilters>({
    search: "",
    status: "all",
    dateRange: {
      from: null,
      to: null,
    },
    employeeId: null,
  });

  const handleFilterChange = (key: keyof ProposalFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Teklif no, müşteri adı veya temsilci ile arama yapın..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-[200px]">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="new">Yeni</SelectItem>
              <SelectItem value="sent">Gönderildi</SelectItem>
              <SelectItem value="review">İncelemede</SelectItem>
              <SelectItem value="negotiation">Görüşmede</SelectItem>
              <SelectItem value="approved">Onaylandı</SelectItem>
              <SelectItem value="rejected">Reddedildi</SelectItem>
              <SelectItem value="expired">Süresi Doldu</SelectItem>
              <SelectItem value="accepted">Kabul Edildi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                <CalendarRange className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "dd MMM", { locale: tr })} -{" "}
                      {format(filters.dateRange.to, "dd MMM, yyyy", { locale: tr })}
                    </>
                  ) : (
                    format(filters.dateRange.from, "dd MMM, yyyy", { locale: tr })
                  )
                ) : (
                  "Tarih Aralığı"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={(range) => {
                  handleFilterChange("dateRange", {
                    from: range?.from || null,
                    to: range?.to || null,
                  });
                }}
                numberOfMonths={2}
                locale={tr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
