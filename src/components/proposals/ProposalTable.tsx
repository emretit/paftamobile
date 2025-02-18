
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProposals } from "@/hooks/useProposals";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ProposalStatus } from "@/types/proposal";
import type { ProposalFilters } from "./ProposalFilters";
import { ProposalActions } from "./ProposalActions";

const statusLabels: Record<ProposalStatus, string> = {
  new: "Yeni",
  review: "İncelemede",
  negotiation: "Görüşmede",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
};

const statusColors: Record<ProposalStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  review: "bg-yellow-100 text-yellow-800",
  negotiation: "bg-purple-100 text-purple-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

interface ProposalTableProps {
  filters?: ProposalFilters;
}

const ProposalTable = ({ filters }: ProposalTableProps) => {
  const { data: proposals, isLoading } = useProposals(filters);

  const handleEdit = (proposal: any) => {
    // Navigation to edit page will be implemented
    console.log("Edit proposal:", proposal);
  };

  const handleComment = (proposal: any) => {
    // Comment dialog will be implemented
    console.log("Comment on proposal:", proposal);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teklif No</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Teklif Tarihi</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Toplam Tutar</TableHead>
            <TableHead>Satış Temsilcisi</TableHead>
            <TableHead>Son Güncelleme</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!proposals?.length ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                Henüz teklif bulunmuyor. Yeni bir teklif oluşturmak için "Yeni Teklif" butonuna tıklayın.
              </TableCell>
            </TableRow>
          ) : (
            proposals.map((proposal) => (
              <TableRow key={proposal.id}>
                <TableCell>#{proposal.proposal_number}</TableCell>
                <TableCell>{proposal.customer?.name}</TableCell>
                <TableCell>
                  {format(new Date(proposal.created_at), 'dd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${statusColors[proposal.status]}`}>
                    {statusLabels[proposal.status]}
                  </span>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }).format(proposal.total_value)}
                </TableCell>
                <TableCell>
                  {proposal.employee ? 
                    `${proposal.employee.first_name} ${proposal.employee.last_name}` : 
                    '-'
                  }
                </TableCell>
                <TableCell>
                  {format(new Date(proposal.updated_at), 'dd MMM yyyy', { locale: tr })}
                </TableCell>
                <TableCell className="text-right">
                  <ProposalActions
                    proposal={proposal}
                    onEdit={handleEdit}
                    onComment={handleComment}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalTable;
