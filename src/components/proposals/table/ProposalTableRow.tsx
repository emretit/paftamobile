
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Proposal } from "@/types/proposal";
import { StatusBadge } from "../detail/StatusBadge";
import { useCustomerNames } from "@/hooks/useCustomerNames";
import { useNavigate } from "react-router-dom";

interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
}

export const ProposalTableRow = ({ proposal, index, formatMoney, onSelect }: ProposalTableRowProps) => {
  const { getCustomerName } = useCustomerNames();
  const navigate = useNavigate();

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd.MM.yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  return (
    <TableRow 
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} cursor-pointer group hover:bg-red-50/30 transition-colors`}
      onClick={() => onSelect(proposal)}
    >
      <TableCell className="font-medium">#{proposal.proposal_number || "-"}</TableCell>
      <TableCell>{proposal.customer_id ? getCustomerName(proposal.customer_id) : "-"}</TableCell>
      <TableCell>
        <StatusBadge status={proposal.status} />
      </TableCell>
      <TableCell>
        {formatDate(proposal.created_at)}
      </TableCell>
      <TableCell>
        {formatDate(proposal.valid_until)}
      </TableCell>
      <TableCell className="font-medium">
        {formatMoney(proposal.total_value)}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/proposals/detail/${proposal.id}`);
            }}
          >
            <Eye className="h-4 w-4 text-red-800" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/proposals/edit/${proposal.id}`);
            }}
          >
            <Pencil className="h-4 w-4 text-red-800" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
