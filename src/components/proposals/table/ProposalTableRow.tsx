
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Eye, PenLine, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProposalStatusCell } from "./ProposalStatusCell";
import { useNavigate } from "react-router-dom";

interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
  onStatusChange: (proposalId: string, newStatus: ProposalStatus) => void;
}

export const ProposalTableRow = ({ 
  proposal, 
  index, 
  formatMoney, 
  onSelect,
  onStatusChange 
}: ProposalTableRowProps) => {
  const navigate = useNavigate();
  
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    
    try {
      return format(new Date(date), "dd MMM yyyy", { locale: tr });
    } catch {
      return "-";
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/proposal/${proposal.id}`);
  };
  
  return (
    <TableRow 
      className="cursor-pointer transition-colors hover:bg-gray-50 h-16"
      onClick={() => onSelect(proposal)}
    >
      <TableCell className="font-medium p-4">#{proposal.number}</TableCell>
      <TableCell className="p-4">
        {proposal.customer ? (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                {proposal.customer.name?.substring(0, 1) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{proposal.customer.name}</div>
              {proposal.customer.company && (
                <div className="text-xs text-muted-foreground">{proposal.customer.company}</div>
              )}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">{proposal.customer_name || "Müşteri yok"}</span>
        )}
      </TableCell>
      <ProposalStatusCell 
        status={proposal.status} 
        proposalId={proposal.id} 
        onStatusChange={onStatusChange} 
      />
      <TableCell className="p-4">
        {proposal.employee ? (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>
                {proposal.employee.first_name?.[0]}
                {proposal.employee.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {proposal.employee.first_name} {proposal.employee.last_name}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="font-medium p-4">{formatMoney(proposal.total_amount || proposal.total_value || 0)}</TableCell>
      <TableCell className="p-4">{formatDate(proposal.created_at)}</TableCell>
      <TableCell className="p-4">{formatDate(proposal.valid_until)}</TableCell>
      <TableCell className="p-4">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(proposal);
            }}
            className="h-8 w-8"
            title="Detayları Görüntüle"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleEdit}
            title="Düzenle"
          >
            <PenLine className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
            title="Diğer İşlemler"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
