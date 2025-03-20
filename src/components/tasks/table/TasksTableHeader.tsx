
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import type { SortField, SortDirection } from "./types";

interface TasksTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

const TasksTableHeader = ({ sortField, sortDirection, handleSort }: TasksTableHeaderProps) => {
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => handleSort("title")}
        >
          <div className="flex items-center">
            Görev Başlığı
            {getSortIcon("title")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => handleSort("due_date")}
        >
          <div className="flex items-center">
            Son Tarih
            {getSortIcon("due_date")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => handleSort("priority")}
        >
          <div className="flex items-center">
            Öncelik
            {getSortIcon("priority")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => handleSort("assignee")}
        >
          <div className="flex items-center">
            Atanan Çalışan
            {getSortIcon("assignee")}
          </div>
        </TableHead>
        <TableHead>
          İlgili Fırsat/Teklif
        </TableHead>
        <TableHead className="w-[180px]">
          Durum
        </TableHead>
        <TableHead className="w-[80px]">İşlemler</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TasksTableHeader;
