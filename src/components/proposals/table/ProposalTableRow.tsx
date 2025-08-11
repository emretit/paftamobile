
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Eye, PenLine, MoreHorizontal, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProposalStatusCell } from "./ProposalStatusCell";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProposalCalculations } from "@/hooks/proposals/useProposalCalculations";
import { formatProposalAmount } from "@/services/workflow/proposalWorkflow";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProposalPdfExporter } from "../ProposalPdfExporter";


interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
  onStatusChange: (proposalId: string, newStatus: ProposalStatus) => void;
  onDelete: (proposalId: string) => void;
}

export const ProposalTableRow = ({ 
  proposal, 
  index, 
  formatMoney, 
  onSelect,
  onStatusChange,
  onDelete
}: ProposalTableRowProps) => {
  const navigate = useNavigate();
  const { calculateTotals } = useProposalCalculations();
  const { toast } = useToast();
  const [showPdfExporter, setShowPdfExporter] = useState(false);
  
  // Use the stored total_amount from database (calculated and saved correctly)
  const getGrandTotal = () => {
    return proposal.total_amount || 0;
  };
  
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
      <TableCell className="font-medium p-4">
        {formatProposalAmount(getGrandTotal(), proposal.currency || 'TRY')}
      </TableCell>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
                title="Diğer İşlemler"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => navigate(`/proposal/${proposal.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Detayları Görüntüle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/proposal/${proposal.id}/edit`)}>
                <PenLine className="h-4 w-4 mr-2" />
                Düzenle
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  // PDF export component'ini modal olarak aç
                  setShowPdfExporter(true);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF Yazdır
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  const newStatus: ProposalStatus = proposal.status === 'draft' ? 'sent' : 'draft';
                  onStatusChange(proposal.id, newStatus);
                }}
              >
                {proposal.status === 'draft' ? 'Gönderildi Olarak İşaretle' : 'Taslak Olarak İşaretle'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(proposal.id)}
                className="text-red-600 focus:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
      
      {/* PDF Export Modal */}
      <Dialog open={showPdfExporter} onOpenChange={setShowPdfExporter}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>PDF Export - {proposal.number}</DialogTitle>
          </DialogHeader>
          <ProposalPdfExporter 
            proposal={proposal}
            onExportComplete={() => setShowPdfExporter(false)}
          />
        </DialogContent>
      </Dialog>
    </TableRow>
  );
};
