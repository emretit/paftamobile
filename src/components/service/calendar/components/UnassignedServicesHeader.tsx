
import React from "react";
import { 
  TableHeader, 
  TableRow, 
  TableHead 
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { SortField, SortDirection } from "@/components/tasks/table/types";

interface UnassignedServicesHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

export const UnassignedServicesHeader: React.FC<UnassignedServicesHeaderProps> = ({
  sortField,
  sortDirection,
  handleSort
}) => {
  // Render sort icon for a column
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <TableHeader>
      <TableRow className="bg-gray-50">
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("title")}
        >
          <div className="flex items-center">
            Servis No
            {getSortIcon("title")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("title")}
        >
          <div className="flex items-center">
            Başlık
            {getSortIcon("title")}
          </div>
        </TableHead>
        <TableHead className="cursor-pointer hover:bg-gray-100">
          <div className="flex items-center">
            Müşteri
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("due_date")}
        >
          <div className="flex items-center">
            Tarih
            {getSortIcon("due_date")}
          </div>
        </TableHead>
        <TableHead className="cursor-pointer hover:bg-gray-100">
          <div className="flex items-center">
            Durum
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("priority")}
        >
          <div className="flex items-center">
            Öncelik
            {getSortIcon("priority")}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
