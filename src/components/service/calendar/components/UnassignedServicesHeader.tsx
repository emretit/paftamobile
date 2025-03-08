
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { SortField, SortDirection } from "@/components/tasks/table/types";

interface UnassignedServicesHeaderProps {
  sortField?: SortField;
  sortDirection?: SortDirection;
  handleSort?: (field: SortField) => void;
}

export const UnassignedServicesHeader: React.FC<UnassignedServicesHeaderProps> = ({
  sortField,
  sortDirection,
  handleSort
}) => {
  const getSortIcon = (field: SortField) => {
    if (!sortField || field !== sortField) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const renderSortableHeader = (label: string, field: SortField) => {
    return (
      <TableHead 
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => handleSort && handleSort(field)}
      >
        <div className="flex items-center">
          {label}
          {getSortIcon(field)}
        </div>
      </TableHead>
    );
  };

  return (
    <TableHeader>
      <TableRow className="bg-gray-50/70">
        {renderSortableHeader("Servis", "title")}
        {renderSortableHeader("Tarih", "due_date")}
        {renderSortableHeader("Öncelik", "priority")}
      </TableRow>
    </TableHeader>
  );
};
