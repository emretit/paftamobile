
import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Column } from "../types";
import { ArrowDown, ArrowUp } from 'lucide-react';

interface ProposalTableHeaderProps {
  columns: Column[];
}

export const ProposalTableHeader = ({ columns }: ProposalTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          column.visible && (
            <TableHead 
              key={column.id}
              className={column.sortable ? 'cursor-pointer select-none' : ''}
            >
              <div className="flex items-center space-x-1">
                <span>{column.label}</span>
                {column.sortable && (
                  <div className="flex flex-col ml-1">
                    <ArrowUp className="h-3 w-3 text-gray-400" />
                    <ArrowDown className="h-3 w-3 text-gray-400 -mt-1" />
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
