import React from "react";
import { Proposal, ProposalStatus, proposalStatusColors, proposalStatusLabels } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DotsHorizontalIcon, Eye, Edit, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { calculateProposalTotals, formatProposalAmount } from "@/services/workflow/proposalWorkflow";
import { useDebounceNavigation } from "@/hooks/useDebounceNavigation";

interface ProposalTableRowProps {
  proposal: Proposal;
}

const ProposalTableRow: React.FC<ProposalTableRowProps> = ({ proposal }) => {
  const { debouncedNavigate } = useDebounceNavigation(300);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "Geçersiz Tarih";
    }
  };

  const totals = proposal.items && proposal.items.length > 0
    ? calculateProposalTotals(proposal.items)
    : { subtotal: 0, taxAmount: 0, total: proposal.total_amount || 0 };

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    debouncedNavigate(`/proposal/${proposal.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    debouncedNavigate(`/proposal/${proposal.id}/edit`);
  };

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    debouncedNavigate(`/proposal/${proposal.id}`);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("Teklif kopyalandı");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Teklif silindi");
  };

  return (
    <tr onClick={handleRowClick} className="hover:bg-muted cursor-pointer">
      <td>
        <div className="flex items-center gap-2">
          <a href={`/proposal/${proposal.id}`} className="font-medium hover:underline">
            {proposal.title}
          </a>
          <Badge className={proposalStatusColors[proposal.status]}>
            {proposalStatusLabels[proposal.status]}
          </Badge>
        </div>
      </td>
      <td>
        {proposal.customer?.name || proposal.customer_name || "Belirtilmemiş"}
      </td>
      <td>{formatProposalAmount(totals.total, proposal.currency)}</td>
      <td>{proposal.valid_until ? formatDate(proposal.valid_until) : "Belirtilmemiş"}</td>
      <td>{formatDate(proposal.created_at)}</td>
      <td className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleViewDetail}>
              <Eye className="mr-2 h-4 w-4" />
              Görüntüle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Kopyala
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

export default ProposalTableRow;
