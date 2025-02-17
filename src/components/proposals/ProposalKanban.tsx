
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FileText, Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const columns = [
  { id: "new", title: "Yeni Teklifler", icon: FileText },
  { id: "review", title: "İncelemede", icon: Users },
  { id: "negotiation", title: "Görüşme Aşamasında", icon: Clock },
  { id: "accepted", title: "Kabul Edildi", icon: CheckCircle2 },
  { id: "rejected", title: "Reddedildi", icon: XCircle },
];

const ProposalKanban = () => {
  const onDragEnd = (result: any) => {
    // TODO: Implement drag and drop functionality
    console.log("Drag ended:", result);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <column.icon className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
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
                  <Card className="p-4 mb-4 bg-white">
                    <p className="text-gray-500 text-center">
                      Henüz bu durumda teklif bulunmuyor
                    </p>
                  </Card>
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
