
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventTypeFilter, EventStatusFilter, EVENT_TYPE_OPTIONS, EVENT_STATUS_OPTIONS } from '@/types/calendar';

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
          {EVENT_TYPE_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
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
          {EVENT_STATUS_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CalendarFilters;
