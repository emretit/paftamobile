
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Proposal } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { statusStyles, statusLabels } from "../constants";

interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
}

export const ProposalTableRow = ({ proposal, index, formatMoney }: ProposalTableRowProps) => {
  return (
    <TableRow 
      className={`
        h-16 transition-colors hover:bg-gray-50/80
        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
      `}
    >
      <TableCell className="p-4 align-middle font-medium">
        #{proposal.proposal_number}
      </TableCell>
      <TableCell className="p-4 align-middle max-w-[200px] truncate">
        {proposal.customer?.name}
      </TableCell>
      <TableCell className="p-4 align-middle">
        <Badge 
          className={`${statusStyles[proposal.status].bg} ${
            statusStyles[proposal.status].text
          }`}
        >
          {statusLabels[proposal.status]}
        </Badge>
      </TableCell>
      <TableCell className="p-4 align-middle max-w-[180px] truncate">
        {proposal.employee && 
          `${proposal.employee.first_name} ${proposal.employee.last_name}`
        }
      </TableCell>
      <TableCell className="p-4 align-middle font-medium tabular-nums">
        {formatMoney(proposal.total_value)}
      </TableCell>
      <TableCell className="p-4 align-middle whitespace-nowrap">
        {format(new Date(proposal.created_at), 'dd MMM yyyy', { locale: tr })}
      </TableCell>
      <TableCell className="p-4 align-middle whitespace-nowrap">
        {proposal.valid_until ? 
          format(new Date(proposal.valid_until), 'dd MMM yyyy', { locale: tr }) 
          : '-'
        }
      </TableCell>
      <TableCell className="p-4 align-middle">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
