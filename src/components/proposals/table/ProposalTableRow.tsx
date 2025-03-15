
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { Proposal } from "@/types/proposal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { statusLabels, statusStyles } from "../constants";
import { useCustomerNames } from "@/hooks/useCustomerNames";
import { useEmployeeNames } from "@/hooks/useEmployeeNames";

interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
}

export const ProposalTableRow = ({ proposal, index, formatMoney, onSelect }: ProposalTableRowProps) => {
  const { getCustomerName } = useCustomerNames();
  const { getEmployeeName } = useEmployeeNames();

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
      <TableCell>{proposal.title || `Teklif #${proposal.proposal_number}`}</TableCell>
      <TableCell>
        {proposal.customer_id ? getCustomerName(proposal.customer_id) : "-"}
      </TableCell>
      <TableCell>
        {getStatusBadge(proposal.status)}
      </TableCell>
      <TableCell className="font-medium">
        {formatMoney(proposal.total_value)}
      </TableCell>
      <TableCell>
        {proposal.created_at ? format(new Date(proposal.created_at), "dd.MM.yyyy") : "-"}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center">
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
