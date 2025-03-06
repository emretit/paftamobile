
import { ChevronUp, ChevronDown } from "lucide-react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import type { SortField, SortDirection } from "./types";

interface TaskTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

const TaskTableHeader = ({ sortField, sortDirection, handleSort }: TaskTableHeaderProps) => {
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
            Task Name
            {getSortIcon("title")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => handleSort("due_date")}
        >
          <div className="flex items-center">
            Due Date
            {getSortIcon("due_date")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => handleSort("priority")}
        >
          <div className="flex items-center">
            Priority
            {getSortIcon("priority")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => handleSort("assignee")}
        >
          <div className="flex items-center">
            Assigned To
            {getSortIcon("assignee")}
          </div>
        </TableHead>
        <TableHead className="w-[180px]">
          Status
        </TableHead>
        <TableHead className="w-[80px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TaskTableHeader;
