import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProposalColumn from "./kanban/ProposalColumn";
import { FileText, Calendar, Check, X, Clock, AlertTriangle } from "lucide-react";
import type { Proposal, ProposalStatus } from "@/types/proposal";
import { changeProposalStatus } from "@/services/crmService";

interface ProposalKanbanProps {
  proposals: Proposal[];
  onProposalSelect: (proposal: Proposal) => void;
}

const columns = [
  { id: "draft", title: "Taslak", icon: FileText, color: "bg-gray-600" },
  { id: "pending_approval", title: "Onay Bekliyor", icon: Clock, color: "bg-amber-600" },
  { id: "sent", title: "Gönderildi", icon: Calendar, color: "bg-blue-600" },
  { id: "accepted", title: "Kabul Edildi", icon: Check, color: "bg-green-600" },
  { id: "rejected", title: "Reddedildi", icon: X, color: "bg-red-600" },
  { id: "expired", title: "Süresi Dolmuş", icon: AlertTriangle, color: "bg-orange-600" }
];

export const ProposalKanban = ({ proposals, onProposalSelect }: ProposalKanbanProps) => {
  const queryClient = useQueryClient();
  const [localProposals, setLocalProposals] = useState<Proposal[]>(proposals);

  useEffect(() => {
    setLocalProposals(proposals);
  }, [proposals]);

  const updateProposalMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProposalStatus }) => {
      await changeProposalStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Teklif durumu güncellendi');
    },
    onError: (error) => {
      toast.error('Teklif güncellenirken bir hata oluştu');
      console.error('Error updating proposal:', error);
    }
  });

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ProposalStatus;
    
    const newProposals = Array.from(localProposals);
    const proposal = newProposals.find(p => p.id === draggableId);
    
    if (proposal) {
      proposal.status = newStatus;
      setLocalProposals(newProposals);

      await updateProposalMutation.mutateAsync({ 
        id: draggableId, 
        status: newStatus 
      });
    }
  };

  const filterProposalsByStatus = (status: string) => {
    return localProposals.filter(proposal => proposal.status === status);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex overflow-x-auto gap-6 pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex-none min-w-[320px]">
            <div className="flex items-center gap-2 mb-4">
              <div className={`h-3 w-3 rounded-full ${column.color}`}></div>
              <h2 className="font-semibold text-gray-900">
                {column.title} ({filterProposalsByStatus(column.id).length})
              </h2>
            </div>
            <ProposalColumn
              id={column.id}
              title={column.title}
              icon={column.icon}
              proposals={filterProposalsByStatus(column.id)}
              onSelect={onProposalSelect}
            />
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
