
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { FileText, Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProposals } from "@/hooks/useProposals";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const columns: {
  id: ProposalStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "new", title: "Yeni Teklifler", icon: FileText },
  { id: "review", title: "İncelemede", icon: Users },
  { id: "negotiation", title: "Görüşme Aşamasında", icon: Clock },
  { id: "accepted", title: "Kabul Edildi", icon: CheckCircle2 },
  { id: "rejected", title: "Reddedildi", icon: XCircle },
];

const ProposalKanban = () => {
  const { data: proposals, isLoading } = useProposals();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getProposalsByStatus = (status: ProposalStatus) => {
    return proposals?.filter((proposal) => proposal.status === status) || [];
  };

  const updateProposalStatus = async (proposalId: string, newStatus: ProposalStatus) => {
    const { error } = await supabase
      .from('proposals')
      .update({ status: newStatus })
      .eq('id', proposalId);

    if (error) {
      throw error;
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update the proposal status
    const newStatus = destination.droppableId as ProposalStatus;
    
    try {
      await updateProposalStatus(draggableId, newStatus);
      
      // Optimistically update the local cache
      queryClient.setQueryData(['proposals'], (oldData: Proposal[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(proposal => 
          proposal.id === draggableId 
            ? { ...proposal, status: newStatus }
            : proposal
        );
      });

      toast({
        title: "Durum güncellendi",
        description: "Teklif durumu başarıyla güncellendi.",
      });
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast({
        title: "Hata",
        description: "Teklif durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
      
      // Refresh the proposals data
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px]">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="bg-gray-50 p-4 rounded-lg min-h-[500px]">
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <column.icon className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {getProposalsByStatus(column.id).length}
              </span>
            </div>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[500px] p-4 rounded-lg ${
                    snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
                  }`}
                >
                  {getProposalsByStatus(column.id).map((proposal, index) => (
                    <Draggable
                      key={proposal.id}
                      draggableId={proposal.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-4 mb-4 bg-white hover:shadow-md transition-shadow ${
                            snapshot.isDragging ? "shadow-lg" : ""
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">#{proposal.proposal_number}</h4>
                              <span className="text-sm text-gray-500">
                                {format(new Date(proposal.created_at), 'dd MMM', { locale: tr })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{proposal.customer?.name}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {new Intl.NumberFormat('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY'
                                }).format(proposal.total_value)}
                              </span>
                              {proposal.employee && (
                                <span className="text-xs text-gray-500">
                                  {`${proposal.employee.first_name} ${proposal.employee.last_name}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {getProposalsByStatus(column.id).length === 0 && (
                    <Card className="p-4 mb-4 bg-white">
                      <p className="text-gray-500 text-center text-sm">
                        Bu durumda teklif bulunmuyor
                      </p>
                    </Card>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default ProposalKanban;
