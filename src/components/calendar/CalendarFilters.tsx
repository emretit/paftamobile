
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventTypeFilter, EventStatusFilter, EVENT_TYPE_OPTIONS, EVENT_STATUS_OPTIONS, Technician } from '@/types/calendar';

interface CalendarFiltersProps {
  typeFilter: EventTypeFilter;
  statusFilter: EventStatusFilter;
  technicianFilter: string;
  technicians: Technician[];
  onTypeFilterChange: (value: EventTypeFilter) => void;
  onStatusFilterChange: (value: EventStatusFilter) => void;
  onTechnicianFilterChange: (value: string) => void;
}

const CalendarFilters = ({
  typeFilter,
  statusFilter,
  technicianFilter,
  technicians,
  onTypeFilterChange,
  onStatusFilterChange,
  onTechnicianFilterChange
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

      <Select
        value={technicianFilter}
        onValueChange={onTechnicianFilterChange}
      >
        <SelectTrigger className="w-[180px] bg-red-950/10 border-red-900/20 text-white">
          <SelectValue placeholder="Teknisyen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tümü</SelectItem>
          {technicians.map(technician => (
            <SelectItem 
              key={technician.id} 
              value={technician.id}
              className="flex items-center gap-2"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: technician.color }} 
              />
              {technician.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CalendarFilters;
