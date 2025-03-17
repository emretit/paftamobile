
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { Droppable, Draggable } from "@hello-pangea/dnd";
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
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="bg-gray-50 p-3 rounded-lg min-h-[500px] h-full"
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
                  className={`mb-2 ${snapshot.isDragging ? "opacity-50" : ""}`}
                >
                  <OpportunityCard
                    opportunity={opportunity}
                    onClick={onOpportunityClick}
                    onSelect={onOpportunitySelect}
                    isSelected={
                      selectedOpportunities.some(
                        (selected) => selected.id === opportunity.id
                      )
                    }
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          {opportunities.length === 0 && (
            <div className="text-center text-gray-500 mt-4">
              <p>Bu kolonda fırsat bulunmuyor</p>
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default OpportunityColumn;
