
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Proposal } from "@/types/proposal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { statusLabels, statusStyles } from "../constants";

interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
}

export const ProposalTableRow = ({ proposal, index, formatMoney, onSelect }: ProposalTableRowProps) => {
  const getStatusBadge = (status: string) => {
    const style = statusStyles[status] || { bg: "bg-gray-100", text: "text-gray-800" };
    const label = statusLabels[status] || status;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${style.bg} ${style.text}`}>
        {label}
      </span>
    );
  };

  return (
    <TableRow 
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} cursor-pointer hover:bg-gray-100`}
      onClick={() => onSelect(proposal)}
    >
      <TableCell>#{proposal.proposal_number}</TableCell>
      <TableCell>
        {proposal.customer?.name || "-"}
      </TableCell>
      <TableCell>
        {getStatusBadge(proposal.status)}
      </TableCell>
      <TableCell>
        {proposal.employee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">
                {proposal.employee.first_name?.[0]}{proposal.employee.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <span>
              {proposal.employee.first_name} {proposal.employee.last_name}
            </span>
          </div>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="font-medium">
        {formatMoney(proposal.total_value)}
      </TableCell>
      <TableCell>
        {proposal.created_at ? format(new Date(proposal.created_at), "dd.MM.yyyy") : "-"}
      </TableCell>
      <TableCell>
        {proposal.valid_until ? format(new Date(proposal.valid_until), "dd.MM.yyyy") : "-"}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(proposal);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/proposals/edit/${proposal.id}`;
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
