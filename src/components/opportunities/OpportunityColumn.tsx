
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Opportunity } from "@/types/crm";
import OpportunityCard from "./OpportunityCard";

interface OpportunityColumnProps {
  id: string;
  title: string;
  opportunities: Opportunity[];
  onOpportunityClick: (opportunity: Opportunity) => void;
}

const OpportunityColumn = ({ 
  id, 
  title, 
  opportunities, 
  onOpportunityClick 
}: OpportunityColumnProps) => {
  return (
    <div className="flex-none w-80">
      <div className="mb-3 px-4 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          {title} ({opportunities.length})
        </h3>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-2 rounded-md min-h-[70vh] ${
              snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
            }`}
          >
            {opportunities.map((opportunity, index) => (
              <Draggable
                key={opportunity.id}
                draggableId={opportunity.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 ${snapshot.isDragging ? "opacity-70" : ""}`}
                  >
                    <OpportunityCard
                      opportunity={opportunity}
                      onClick={() => onOpportunityClick(opportunity)}
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
    </div>
  );
};

export default OpportunityColumn;
