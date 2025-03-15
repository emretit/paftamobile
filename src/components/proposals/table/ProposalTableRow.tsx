
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Proposal } from "@/types/proposal";
import { StatusBadge } from "../detail/StatusBadge";
import { useCustomerNames } from "@/hooks/useCustomerNames";
import { useEmployeeNames } from "@/hooks/useEmployeeNames";
import { useNavigate } from "react-router-dom";

interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
}

export const ProposalTableRow = ({ proposal, index, formatMoney, onSelect }: ProposalTableRowProps) => {
  const { getCustomerName } = useCustomerNames();
  const { getEmployeeName } = useEmployeeNames();
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
      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} cursor-pointer hover:bg-gray-100`}
      onClick={() => onSelect(proposal)}
    >
      <TableCell>#{proposal.proposal_number || "-"}</TableCell>
      <TableCell>{proposal.customer_id ? getCustomerName(proposal.customer_id) : "-"}</TableCell>
      <TableCell>
        <StatusBadge status={proposal.status} />
      </TableCell>
      <TableCell>{proposal.employee_id ? getEmployeeName(proposal.employee_id) : "-"}</TableCell>
      <TableCell className="font-medium">
        {formatMoney(proposal.total_value)}
      </TableCell>
      <TableCell>
        {formatDate(proposal.created_at)}
      </TableCell>
      <TableCell>
        {formatDate(proposal.valid_until)}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/proposals/detail/${proposal.id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
