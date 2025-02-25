
import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { useProposals } from "@/hooks/useProposals";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProposalStatus } from "@/types/proposal";
import { ProposalFilters } from "./ProposalFilters";
import { Column } from "./types";
import { ProposalTableHeader } from "./table/ProposalTableHeader";
import { ProposalTableRow } from "./table/ProposalTableRow";
import { ProposalTableSkeleton } from "./table/ProposalTableSkeleton";

interface ProposalTableProps {
  filters: ProposalFilters;
}

const ProposalTable = ({ filters }: ProposalTableProps) => {
  const { data: proposals, isLoading } = useProposals(filters);
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
    return <ProposalTableSkeleton />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <ProposalTableHeader columns={columns} />
        <TableBody>
          {proposals?.map((proposal, index) => (
            <ProposalTableRow
              key={proposal.id}
              proposal={proposal}
              index={index}
              formatMoney={formatMoney}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalTable;
