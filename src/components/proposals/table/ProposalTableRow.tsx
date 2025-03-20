
import { TableCell, TableRow } from "@/components/ui/table";
import { Proposal } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "../detail/StatusBadge";

interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
}

export const ProposalTableRow = ({ proposal, index, formatMoney, onSelect }: ProposalTableRowProps) => {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    
    try {
      return format(new Date(date), "dd MMM yyyy", { locale: tr });
    } catch {
      return "-";
    }
  };
  
  return (
    <TableRow className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
      <TableCell className="font-medium">#{proposal.number || proposal.proposal_number}</TableCell>
      <TableCell>
        {proposal.customer ? (
          <div>
            <div className="font-medium">{proposal.customer.name}</div>
            {proposal.customer.company && (
              <div className="text-xs text-muted-foreground">{proposal.customer.company}</div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{proposal.customer_name || "Müşteri yok"}</span>
        )}
      </TableCell>
      <TableCell>
        <StatusBadge status={proposal.status as any} />
      </TableCell>
      <TableCell>{formatDate(proposal.created_at)}</TableCell>
      <TableCell>{formatDate(proposal.valid_until)}</TableCell>
      <TableCell className="font-medium">{formatMoney(proposal.total_amount || proposal.total_value || 0)}</TableCell>
      <TableCell>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSelect(proposal)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
