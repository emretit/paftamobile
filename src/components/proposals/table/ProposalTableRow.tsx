
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Proposal } from "@/types/proposal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
}

export const ProposalTableRow = ({ proposal, index, formatMoney, onSelect }: ProposalTableRowProps) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (status) {
      case "draft":
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Taslak</span>;
      case "new":
      case "discovery_scheduled":
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Keşif Planlandı</span>;
      case "meeting_completed":
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Görüşme Tamamlandı</span>;
      case "quote_in_progress":
        return <span className={`${baseClasses} bg-violet-100 text-violet-800`}>Teklif Hazırlanıyor</span>;
      case "sent":
      case "quote_sent":
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Teklif Gönderildi</span>;
      case "negotiation":
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Müzakere Aşaması</span>;
      case "accepted":
      case "approved":
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Onaylandı</span>;
      case "rejected":
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Reddedildi</span>;
      case "converted_to_order":
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Siparişe Dönüştü</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <TableRow className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSelect(proposal)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = `/proposals/edit/${proposal.id}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
