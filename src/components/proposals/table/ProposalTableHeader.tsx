
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Column } from "../types";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProposalTableHeaderProps {
  columns: Column[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (fieldId: string) => void;
}

export const ProposalTableHeader = ({ 
  columns, 
  sortField, 
  sortDirection, 
  onSort 
}: ProposalTableHeaderProps) => {
  const getSortIcon = (field: string) => {
    if (field !== sortField) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUp className="h-4 w-4 ml-1" />
      : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <TableHeader>
      <TableRow className="bg-gray-50">
        {columns.map((column) => (
          column.visible && (
            <TableHead 
              key={column.id}
              className={cn(
                "h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap",
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
              )}
              onClick={column.sortable && onSort ? () => onSort(column.id) : undefined}
            >
              <div className="flex items-center">
                <span>{column.label}</span>
                {column.sortable && getSortIcon(column.id)}
              </div>
            </TableHead>
          )
        ))}
      </TableRow>
    </TableHeader>
  );
};
