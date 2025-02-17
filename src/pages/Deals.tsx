
import { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import DealDetailsModal from "@/components/deals/DealDetailsModal";
import DealStats from "@/components/deals/DealStats";
import DealColumn from "@/components/deals/DealColumn";
import { Deal } from "@/types/deal";
import {
  Filter,
  Plus,
  AlertCircle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface DealsState {
  new: Deal[];
  negotiation: Deal[];
  follow_up: Deal[];
  won: Deal[];
  lost: Deal[];
}

interface DealsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Deals = ({ isCollapsed, setIsCollapsed }: DealsProps) => {
  const [deals, setDeals] = useState<DealsState>({
    new: [
      {
        id: "1",
        title: "Kurumsal Yazılım Çözümü",
        value: 50000,
        customerName: "Tech Corp",
        employeeName: "Ahmet Yılmaz",
        priority: "high",
        status: "new",
        proposalDate: new Date(),
        lastContactDate: new Date(),
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: "Kurumsal yazılım çözümü, uygulama ve eğitim dahil.",
        department: "Kurumsal Satış",
        contactHistory: [],
        proposalFiles: [],
        nextSteps: [
          { id: 1, action: "Teknik inceleme planla", dueDate: "2024-03-20" }
        ],
        productServices: [
          { id: 1, name: "Kurumsal Lisans", quantity: 1, price: 35000 },
          { id: 2, name: "Uygulama Hizmeti", quantity: 1, price: 15000 }
        ],
        reminders: []
      },
      {
        id: "2",
        title: "Bulut Göç Projesi",
        value: 25000,
        customerName: "StartUp A.Ş.",
        employeeName: "Zeynep Kaya",
        priority: "medium",
        status: "new",
        proposalDate: new Date(),
        lastContactDate: new Date(),
        department: "Bulut Çözümleri",
        contactHistory: [],
        proposalFiles: [],
        nextSteps: [],
        productServices: [],
        reminders: []
      },
    ],
    negotiation: [],
    follow_up: [],
    won: [],
    lost: [],
  });

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId === destination.droppableId) {
      const column = Array.from(deals[source.droppableId as keyof DealsState]);
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      setDeals({ ...deals, [source.droppableId]: column });
      return;
    }

    const sourceColumn = Array.from(deals[source.droppableId as keyof DealsState]);
    const destColumn = Array.from(deals[destination.droppableId as keyof DealsState]);
    const [removed] = sourceColumn.splice(source.index, 1);
    const updatedDeal = { ...removed, status: destination.droppableId };
    destColumn.splice(destination.index, 0, updatedDeal);
    setDeals({
      ...deals,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });
  };

  const columns = [
    { id: "new", title: "Yeni Teklifler", icon: AlertCircle },
    { id: "negotiation", title: "Görüşmede", icon: Users },
    { id: "follow_up", title: "Takipte", icon: Clock },
    { id: "won", title: "Kazanıldı", icon: CheckCircle2 },
    { id: "lost", title: "Kaybedildi", icon: XCircle },
  ];

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main 
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-[60px]' : 'ml-[60px] sm:ml-64'
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fırsatlar Sayfası</h1>
              <p className="text-gray-600 mt-1">Fırsatlarınızı takip edin ve yönetin</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Fırsat Ekle
              </Button>
            </div>
          </div>

          {/* Stats */}
          <DealStats />

          {/* Kanban Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col lg:flex-row gap-6">
              {columns.map((column) => (
                <DealColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  icon={column.icon}
                  deals={deals[column.id as keyof DealsState]}
                  onDealClick={handleDealClick}
                />
              ))}
            </div>
          </DragDropContext>
          
          <DealDetailsModal
            deal={selectedDeal}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </main>
    </div>
  );
};

export default Deals;
