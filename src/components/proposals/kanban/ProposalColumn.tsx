
import { Droppable, Draggable } from "@hello-pangea/dnd";
import ProposalCard from "./ProposalCard";
import type { Proposal } from "@/types/proposal";

interface ProposalColumnProps {
  id: string;
  title: string;
  proposals: Proposal[];
  onSelect: (proposal: Proposal) => void;
}

const ProposalColumn = ({ id, title, proposals, onSelect }: ProposalColumnProps) => {
  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-4 min-h-[500px] p-4 rounded-lg ${
            snapshot.isDraggingOver ? "bg-gray-100/80" : "bg-gray-50/50"
          }`}
        >
          {proposals.map((proposal, index) => (
            <Draggable key={proposal.id} draggableId={proposal.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={snapshot.isDragging ? "shadow-lg" : ""}
                >
                  <ProposalCard proposal={proposal} onSelect={onSelect} />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          {proposals.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              Bu sütunda teklif yok
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default ProposalColumn;
