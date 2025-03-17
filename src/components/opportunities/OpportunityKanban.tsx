
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { 
  Opportunity, 
  OpportunityStatus, 
  opportunityStatusLabels 
} from "@/types/crm";
import OpportunityColumn from "./OpportunityColumn";

interface OpportunityKanbanProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onOpportunityClick: (opportunity: Opportunity) => void;
  onStatusChange: (opportunityId: string, newStatus: OpportunityStatus) => void;
}

const kanbanColumns: { id: OpportunityStatus; title: string }[] = [
  { id: 'new', title: 'Yeni' },
  { id: 'first_contact', title: 'İlk Görüşme' },
  { id: 'site_visit', title: 'Ziyaret Yapıldı' },
  { id: 'preparing_proposal', title: 'Teklif Hazırlanıyor' },
  { id: 'proposal_sent', title: 'Teklif Gönderildi' },
  { id: 'accepted', title: 'Kabul Edildi' },
  { id: 'lost', title: 'Kaybedildi' }
];

const OpportunityKanban = ({ 
  opportunities, 
  isLoading, 
  onOpportunityClick,
  onStatusChange 
}: OpportunityKanbanProps) => {
  
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Return if no destination
    if (!destination) return;

    // Return if dropped at the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update opportunity status
    const newStatus = destination.droppableId as OpportunityStatus;
    onStatusChange(draggableId, newStatus);
  };

  const filterOpportunitiesByStatus = (status: OpportunityStatus) => {
    return opportunities.filter(opp => opp.status === status);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex overflow-x-auto pb-4 space-x-4">
        {kanbanColumns.map(column => (
          <div 
            key={column.id} 
            className="flex-none w-80 bg-gray-100 rounded-md p-4"
          >
            <h3 className="font-medium text-gray-900 mb-3">{column.title}</h3>
            <div className="animate-pulse space-y-3">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex overflow-x-auto pb-4 space-x-4">
        {kanbanColumns.map(column => (
          <OpportunityColumn
            key={column.id}
            id={column.id}
            title={column.title}
            opportunities={filterOpportunitiesByStatus(column.id)}
            onOpportunityClick={onOpportunityClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default OpportunityKanban;
