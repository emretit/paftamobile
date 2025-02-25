
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useProposals } from "@/hooks/useProposals";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface Column {
  id: keyof Proposal | 'actions';
  label: string;
  visible: boolean;
  sortable?: boolean;
}

const statusStyles: Record<ProposalStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-800" },
  sent: { bg: "bg-blue-100", text: "text-blue-800" },
  approved: { bg: "bg-green-100", text: "text-green-800" },
  rejected: { bg: "bg-red-100", text: "text-red-800" },
  expired: { bg: "bg-yellow-100", text: "text-yellow-800" }
};

const ProposalTable = () => {
  const { data: proposals, isLoading } = useProposals();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [columns] = useState<Column[]>([
    { id: "proposal_number", label: "Teklif No", visible: true, sortable: true },
    { id: "customer_id", label: "Müşteri", visible: true },
    { id: "status", label: "Durum", visible: true },
    { id: "employee_id", label: "Satış Temsilcisi", visible: true },
    { id: "total_value", label: "Toplam Tutar", visible: true, sortable: true },
    { id: "created_at", label: "Oluşturma Tarihi", visible: true, sortable: true },
    { id: "valid_until", label: "Geçerlilik", visible: true },
    { id: "actions", label: "İşlemler", visible: true },
  ]);

  const updateProposalStatus = async (proposalId: string, newStatus: ProposalStatus) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', proposalId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      
      toast({
        title: "Durum güncellendi",
        description: "Teklif durumu başarıyla güncellendi.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast({
        title: "Hata",
        description: "Teklif durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-100 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-gray-50/50">
            {columns.filter(col => col.visible).map((column) => (
              <TableHead 
                key={column.id}
                className="h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 whitespace-nowrap"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {proposals?.map((proposal, index) => (
            <TableRow 
              key={proposal.id} 
              className={`
                h-16 transition-colors hover:bg-gray-50/80
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
              `}
            >
              <TableCell className="p-4 align-middle font-medium">
                #{proposal.proposal_number}
              </TableCell>
              <TableCell className="p-4 align-middle max-w-[200px] truncate">
                {proposal.customer?.name}
              </TableCell>
              <TableCell className="p-4 align-middle">
                <Badge 
                  className={`${statusStyles[proposal.status as ProposalStatus].bg} ${
                    statusStyles[proposal.status as ProposalStatus].text
                  }`}
                >
                  {proposal.status === 'draft' ? 'Taslak' :
                   proposal.status === 'sent' ? 'Gönderildi' :
                   proposal.status === 'approved' ? 'Onaylandı' :
                   proposal.status === 'rejected' ? 'Reddedildi' : 'Süresi Doldu'}
                </Badge>
              </TableCell>
              <TableCell className="p-4 align-middle max-w-[180px] truncate">
                {proposal.employee && 
                  `${proposal.employee.first_name} ${proposal.employee.last_name}`
                }
              </TableCell>
              <TableCell className="p-4 align-middle font-medium tabular-nums">
                {formatMoney(proposal.total_value)}
              </TableCell>
              <TableCell className="p-4 align-middle whitespace-nowrap">
                {format(new Date(proposal.created_at), 'dd MMM yyyy', { locale: tr })}
              </TableCell>
              <TableCell className="p-4 align-middle whitespace-nowrap">
                {proposal.valid_until ? 
                  format(new Date(proposal.valid_until), 'dd MMM yyyy', { locale: tr }) 
                  : '-'
                }
              </TableCell>
              <TableCell className="p-4 align-middle">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalTable;
