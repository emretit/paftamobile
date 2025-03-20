
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
  
  return (
    <TableHeader>
      <TableRow className="bg-gray-50">
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("title")}
        >
          <div className="flex items-center">
            Başlık
            {getSortIcon("title")}
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
        
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("priority")}
        >
          <div className="flex items-center">
            Öncelik
            {getSortIcon("priority")}
          </div>
        </TableHead>
        
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("assignee")}
        >
          <div className="flex items-center">
            Sorumlu
            {getSortIcon("assignee")}
          </div>
        </TableHead>
        
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("related_item")}
        >
          <div className="flex items-center">
            İlişkili Öğe
            {getSortIcon("related_item")}
          </div>
        </TableHead>
        
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("status")}
        >
          <div className="flex items-center">
            Durum
            {getSortIcon("status")}
          </div>
        </TableHead>
        
        <TableHead className="text-right">
          İşlemler
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TasksTableHeader;
