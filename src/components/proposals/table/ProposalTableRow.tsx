
import React, { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Eye, PenLine, MoreHorizontal, Trash2, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProposalStatusCell } from "./ProposalStatusCell";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProposalCalculations } from "@/hooks/proposals/useProposalCalculations";
import { formatProposalAmount } from "@/services/workflow/proposalWorkflow";
import { useToast } from "@/hooks/use-toast";
import { SimplePdfExportService, PdfTemplate } from "@/services/pdf/simplePdfExport";

// import { ProposalPdfExporter } from "../ProposalPdfExporter";


interface ProposalTableRowProps {
  proposal: Proposal;
  index: number;
  formatMoney: (amount: number) => string;
  onSelect: (proposal: Proposal) => void;
  onStatusChange: (proposalId: string, newStatus: ProposalStatus) => void;
  onDelete: (proposalId: string) => void;
}

export const ProposalTableRow: React.FC<ProposalTableRowProps> = ({ 
  proposal, 
  index, 
  formatMoney, 
  onSelect,
  onStatusChange,
  onDelete
}) => {
  const navigate = useNavigate();
  const { calculateTotals } = useProposalCalculations();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Load templates when component mounts
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const data = await SimplePdfExportService.getTemplates('quote');
      setTemplates(data);
      
      // Set default template as selected
      const defaultTemplate = data.find(t => t.is_default) || data[0];
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };
  
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

  const handlePdfPrint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Use simple PDF export service with selected template
      await SimplePdfExportService.openPdf(proposal, selectedTemplateId);
      
      toast({
        title: "PDF Açıldı",
        description: "PDF yeni sekmede açıldı",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Hata",
        description: "PDF oluşturulamadı: " + (error as Error).message,
        variant: "destructive",
      });
    }
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

              <DropdownMenuItem onClick={handlePdfPrint}>
                <FileText className="mr-2 h-4 w-4" />
                PDF Yazdır
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={(e) => e.preventDefault()}
                className="cursor-default"
              >
                <div className="flex flex-col space-y-2 w-full">
                  <span className="text-xs text-muted-foreground">Şablon Seç:</span>
                  <Select 
                    value={selectedTemplateId} 
                    onValueChange={setSelectedTemplateId}
                    onOpenChange={(e) => e.preventDefault()}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Şablon seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} {template.is_default && '(Varsayılan)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
      

    </TableRow>
  );
};
