
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import OpportunityCard from "./OpportunityCard";

interface OpportunityColumnProps {
  id: OpportunityStatus;
  title: string;
  opportunities: Opportunity[];
  onOpportunityClick: (opportunity: Opportunity) => void;
  onOpportunitySelect?: (opportunity: Opportunity) => void;
  selectedOpportunities?: Opportunity[];
}

const OpportunityColumn = ({ 
  id, 
  title, 
  opportunities, 
  onOpportunityClick, 
  onOpportunitySelect, 
  selectedOpportunities = [] 
}: OpportunityColumnProps) => {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-4 min-h-[500px] p-4 rounded-lg ${
            snapshot.isDraggingOver ? "bg-red-50" : "bg-gray-50"
          }`}
        >
          {opportunities.map((opportunity, index) => (
            <Draggable key={opportunity.id} draggableId={opportunity.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={snapshot.isDragging ? "shadow-lg" : ""}
                >
                  <OpportunityCard
                    opportunity={opportunity}
                    onClick={onOpportunityClick}
                    onSelect={onOpportunitySelect}
                    isSelected={selectedOpportunities.some(d => d.id === opportunity.id)}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          {opportunities.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              Bu sütunda fırsat yok
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default OpportunityColumn;
