
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Column } from "../types";
import { ArrowDown, ArrowUp } from 'lucide-react';
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
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          column.visible && (
            <TableHead 
              key={column.id}
              className={column.sortable ? 'cursor-pointer select-none' : ''}
              onClick={column.sortable && onSort ? () => onSort(column.id) : undefined}
            >
              <div className="flex items-center space-x-1">
                <span>{column.label}</span>
                {column.sortable && (
                  <div className="flex flex-col ml-1">
                    <ArrowUp className={cn(
                      "h-3 w-3", 
                      sortField === column.id && sortDirection === 'asc' 
                        ? "text-red-800" 
                        : "text-gray-400"
                    )} />
                    <ArrowDown className={cn(
                      "h-3 w-3 -mt-1", 
                      sortField === column.id && sortDirection === 'desc' 
                        ? "text-red-800" 
                        : "text-gray-400"
                    )} />
                  </div>
                )}
              </div>
            </TableHead>
          )
        ))}
      </TableRow>
    </TableHeader>
  );
};
