
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Column } from "../types";

interface ProposalTableHeaderProps {
  columns: Column[];
}

export const ProposalTableHeader = ({ columns }: ProposalTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow className="border-b bg-gray-50/50">
        {columns.filter(col => col.visible).map((column) => (
          <TableHead 
            key={column.id}
            className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 whitespace-nowrap"
          >
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
