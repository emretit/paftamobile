
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Column } from "../types";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProposalTableHeaderProps {
  columns: Column[];
  sortable?: boolean;
  onSort?: (columnId: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

export const ProposalTableHeader = ({ 
  columns, 
  sortable = false,
  onSort,
  sortColumn,
  sortDirection
}: ProposalTableHeaderProps) => {
  const visibleColumns = columns.filter(col => col.visible);
  
  return (
    <TableHeader className="bg-red-50 text-red-950">
      <TableRow>
        {visibleColumns.map((column) => (
          <TableHead key={column.id} className="font-semibold">
            {column.sortable && sortable ? (
              <Button
                variant="ghost"
                onClick={() => onSort && onSort(column.id)}
                className="flex items-center gap-1 py-0 h-auto hover:bg-red-100/50 hover:text-red-900 -ml-3"
              >
                {column.label}
                <ArrowUpDown className="h-3 w-3 text-red-800" />
              </Button>
            ) : (
              column.label
            )}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
