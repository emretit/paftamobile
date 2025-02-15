
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Deal } from "@/types/deal";
import DealCard from "./DealCard";
import { LucideIcon } from "lucide-react";

interface DealColumnProps {
  id: string;
  title: string;
  icon: LucideIcon;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const DealColumn = ({ id, title, icon: Icon, deals, onDealClick }: DealColumnProps) => {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-500" />
        <h2 className="font-semibold text-gray-900">
          {title} ({deals.length})
        </h2>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-4 min-h-[500px] p-4 rounded-lg ${
              snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
            }`}
          >
            {deals.map((deal, index) => (
              <Draggable key={deal.id} draggableId={deal.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? "shadow-lg" : ""}
                  >
                    <DealCard deal={deal} onClick={onDealClick} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DealColumn;
