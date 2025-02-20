
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventTypeFilter, EventStatusFilter, EVENT_TYPES, EVENT_STATUSES } from '@/types/calendar';

interface CalendarFiltersProps {
  typeFilter: EventTypeFilter;
  statusFilter: EventStatusFilter;
  onTypeFilterChange: (value: EventTypeFilter) => void;
  onStatusFilterChange: (value: EventStatusFilter) => void;
}

const CalendarFilters = ({
  typeFilter,
  statusFilter,
  onTypeFilterChange,
  onStatusFilterChange
}: CalendarFiltersProps) => {
  return (
    <div className="flex gap-4">
      <Select
        value={typeFilter}
        onValueChange={(value) => onTypeFilterChange(value as EventTypeFilter)}
      >
        <SelectTrigger className="w-[180px] bg-red-950/10 border-red-900/20 text-white">
          <SelectValue placeholder="Etkinlik Tipi" />
        </SelectTrigger>
        <SelectContent>
          {EVENT_TYPES.map(type => (
            <SelectItem key={type} value={type}>
              {type === 'all' ? 'Tümü' : type === 'technical' ? 'Teknik' : 'Satış'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusFilterChange(value as EventStatusFilter)}
      >
        <SelectTrigger className="w-[180px] bg-red-950/10 border-red-900/20 text-white">
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          {EVENT_STATUSES.map(status => (
            <SelectItem key={status} value={status}>
              {status === 'all' ? 'Tümü' : 
               status === 'scheduled' ? 'Planlandı' : 
               status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CalendarFilters;
