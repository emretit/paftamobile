
import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { SortField, SortDirection } from "./types";
import { cn } from "@/lib/utils";

interface TasksTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

const TasksTableHeader: React.FC<TasksTableHeaderProps> = ({ 
  sortField,
  sortDirection,
  handleSort
}) => {
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const renderSortableHeader = (label: string, field: SortField) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-100 h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {getSortIcon(field)}
      </div>
    </TableHead>
  );
  
  return (
    <TableHeader>
      <TableRow className="bg-gray-50 border-b">
        {renderSortableHeader("Başlık", "title")}
        {renderSortableHeader("Tarih", "due_date")}
        {renderSortableHeader("Öncelik", "priority")}
        {renderSortableHeader("Sorumlu", "assignee")}
        {renderSortableHeader("İlişkili Öğe", "related_item")}
        {renderSortableHeader("Durum", "status")}
        <TableHead className="text-right h-12 px-4 align-middle font-medium text-muted-foreground whitespace-nowrap">
          İşlemler
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TasksTableHeader;
