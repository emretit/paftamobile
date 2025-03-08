
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { SortField, SortDirection } from "@/components/tasks/table/types";

interface ServiceTableHeaderProps {
  sortField?: SortField;
  sortDirection?: SortDirection;
  handleSort?: (field: SortField) => void;
}

const ServiceTableHeader: React.FC<ServiceTableHeaderProps> = ({ 
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
    const isClickable = !!handleSort;
    return (
      <TableHead 
        className={isClickable ? "cursor-pointer hover:bg-gray-50" : ""}
        onClick={() => isClickable && handleSort(field)}
      >
        {isClickable ? (
          <div className="flex items-center">
            {label}
            {getSortIcon(field)}
          </div>
        ) : (
          label
        )}
      </TableHead>
    );
  };
  
  return (
    <TableHeader>
      <TableRow className="bg-gray-50">
        {renderSortableHeader("Servis No", "title")}
        {renderSortableHeader("Başlık", "title")}
        {renderSortableHeader("Müşteri", "customer")}
        {renderSortableHeader("Tarih", "due_date")}
        {renderSortableHeader("Teknisyen", "assignee")}
        {renderSortableHeader("Durum", "status")}
        {renderSortableHeader("Öncelik", "priority")}
        <TableHead className="text-right">İşlemler</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ServiceTableHeader;
