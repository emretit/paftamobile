
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
  allowedSourceStatuses?: ProposalStatus[];
}[] = [
  { 
    id: "new", 
    title: "Yeni Teklifler", 
    icon: FileText,
    allowedSourceStatuses: ["review"] // New proposals can only come back from review
  },
  { 
    id: "review", 
    title: "İncelemede", 
    icon: Users,
    allowedSourceStatuses: ["new", "negotiation"] // Can receive from new or negotiation
  },
  { 
    id: "negotiation", 
    title: "Görüşme Aşamasında", 
    icon: Clock,
    allowedSourceStatuses: ["review"] // Can only come from review
  },
  { 
    id: "accepted", 
    title: "Kabul Edildi", 
    icon: CheckCircle2,
    allowedSourceStatuses: ["negotiation", "review"] // Can be accepted from negotiation or review
  },
  { 
    id: "rejected", 
    title: "Reddedildi", 
    icon: XCircle,
    allowedSourceStatuses: ["negotiation", "review"] // Can be rejected from negotiation or review
  },
];

const ProposalKanban = () => {
  const { data: proposals, isLoading } = useProposals();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getProposalsByStatus = (status: ProposalStatus) => {
    return proposals?.filter((proposal) => proposal.status === status) || [];
  };

  const isMovementAllowed = (sourceStatus: ProposalStatus, destinationStatus: ProposalStatus) => {
    const destinationColumn = columns.find(col => col.id === destinationStatus);
    if (!destinationColumn?.allowedSourceStatuses) return false;
    return destinationColumn.allowedSourceStatuses.includes(sourceStatus);
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

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const proposal = proposals?.find(p => p.id === draggableId);
    if (!proposal) return;

    if (!isMovementAllowed(proposal.status, destination.droppableId as ProposalStatus)) {
      toast({
        title: "İzin verilmeyen hareket",
        description: "Bu durum değişikliğine izin verilmiyor.",
        variant: "destructive",
      });
      return;
    }

    const newStatus = destination.droppableId as ProposalStatus;
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destinationColumn = columns.find(col => col.id === destination.droppableId);
    
    try {
      await updateProposalStatus(draggableId, newStatus);
      
      queryClient.setQueryData(['proposals'], (oldData: Proposal[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(proposal => 
          proposal.id === draggableId 
            ? { ...proposal, status: newStatus }
            : proposal
        );
      });

      toast({
        title: `${sourceColumn?.title} → ${destinationColumn?.title}`,
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
      
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px]">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="bg-gray-50 p-4 rounded-lg min-h-[500px]">
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-24 bg-gray-200 rounded-lg"></div>
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
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <column.icon className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="ml-auto bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-sm font-medium">
                {getProposalsByStatus(column.id).length}
              </span>
            </div>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[500px] p-4 rounded-lg transition-colors duration-200 ${
                    snapshot.isDraggingOver 
                      ? "bg-gray-100/80 ring-2 ring-primary/20" 
                      : "bg-gray-50/80"
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
                          className={`group p-4 mb-3 bg-white rounded-lg border-border/50 transition-all duration-200 ${
                            snapshot.isDragging 
                              ? "shadow-lg scale-[1.02] ring-2 ring-primary/20 rotate-1" 
                              : "hover:shadow-md hover:border-border"
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                                #{proposal.proposal_number}
                              </h4>
                              <span className="text-sm text-gray-500 tabular-nums">
                                {format(new Date(proposal.created_at), 'dd MMM', { locale: tr })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1">{proposal.customer?.name}</p>
                            <div className="flex justify-between items-center pt-0.5">
                              <span className="text-sm font-medium tabular-nums">
                                {new Intl.NumberFormat('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0
                                }).format(proposal.total_value)}
                              </span>
                              {proposal.employee && (
                                <span className="text-xs text-gray-500 truncate max-w-[120px]">
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
                    <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-lg">
                      <p className="text-gray-500 text-sm">
                        Bu durumda teklif bulunmuyor
                      </p>
                    </div>
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
