
import { DragDropContext } from "@hello-pangea/dnd";
import { AlertCircle, Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Deal } from "@/types/deal";
import DealColumn from "./DealColumn";

interface DealsState {
  new: Deal[];
  negotiation: Deal[];
  follow_up: Deal[];
  won: Deal[];
  lost: Deal[];
}

interface DealsKanbanProps {
  deals: DealsState;
  onDragEnd: (result: any) => void;
  onDealClick: (deal: Deal) => void;
  onDealSelect: (deal: Deal) => void;
  selectedDeals: Deal[];
}

const columns = [
  { id: "new", title: "Yeni Teklifler", icon: AlertCircle },
  { id: "negotiation", title: "Görüşmede", icon: Users },
  { id: "follow_up", title: "Takipte", icon: Clock },
  { id: "won", title: "Kazanıldı", icon: CheckCircle2 },
  { id: "lost", title: "Kaybedildi", icon: XCircle },
];

const DealsKanban = ({
  deals,
  onDragEnd,
  onDealClick,
  onDealSelect,
  selectedDeals,
}: DealsKanbanProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6">
        {columns.map((column) => (
          <DealColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            deals={deals[column.id as keyof DealsState]}
            onDealClick={onDealClick}
            onDealSelect={onDealSelect}
            selectedDeals={selectedDeals}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default DealsKanban;
