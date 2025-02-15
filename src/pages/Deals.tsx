
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import DealDetailsModal from "@/components/deals/DealDetailsModal";
import {
  Filter,
  Plus,
  AlertCircle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  status: "new" | "negotiation" | "follow_up" | "won" | "lost";
  priority: "low" | "medium" | "high";
  customerName: string;
  employeeName: string;
  expectedCloseDate?: Date;
  proposalDate: Date;
  lastContactDate: Date;
  notes?: string;
  internalComments?: string;
}

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
        title: "Enterprise Software Solution",
        value: 50000,
        customerName: "Tech Corp",
        employeeName: "John Smith",
        priority: "high",
        status: "new",
        proposalDate: new Date(),
        lastContactDate: new Date(),
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: "Complete enterprise software solution including implementation and training.",
      },
      {
        id: "2",
        title: "Cloud Migration Project",
        value: 25000,
        customerName: "StartUp Inc",
        employeeName: "Sarah Johnson",
        priority: "medium",
        status: "new",
        proposalDate: new Date(),
        lastContactDate: new Date(),
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
    { id: "new", title: "New Proposals", icon: AlertCircle },
    { id: "negotiation", title: "In Negotiation", icon: Users },
    { id: "follow_up", title: "Follow Up", icon: Clock },
    { id: "won", title: "Won", icon: CheckCircle2 },
    { id: "lost", title: "Lost", icon: XCircle },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Deals Pipeline</h1>
              <p className="text-gray-600 mt-1">Track and manage your opportunities</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                  <p className="text-2xl font-bold mt-1">$240,000</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                12% from last month
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Won Deals</p>
                  <p className="text-2xl font-bold mt-1">$120,000</p>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                8% from last month
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lost Deals</p>
                  <p className="text-2xl font-bold mt-1">$35,000</p>
                </div>
                <div className="bg-red-100 p-2 rounded-lg">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-red-600 mt-2 flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                5% from last month
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold mt-1">67%</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                2% from last month
              </p>
            </Card>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col lg:flex-row gap-6">
              {columns.map((column) => (
                <div key={column.id} className="flex-1 min-w-[300px]">
                  <div className="flex items-center gap-2 mb-4">
                    <column.icon className="h-5 w-5 text-gray-500" />
                    <h2 className="font-semibold text-gray-900">
                      {column.title} ({deals[column.id as keyof DealsState].length})
                    </h2>
                  </div>
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-4 min-h-[500px] p-4 rounded-lg ${
                          snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
                        }`}
                      >
                        {deals[column.id as keyof DealsState].map((deal, index) => (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 cursor-move bg-white ${
                                  snapshot.isDragging ? "shadow-lg" : "hover:shadow-md"
                                } transition-shadow`}
                                onClick={() => handleDealClick(deal)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium text-gray-900">{deal.title}</h3>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(deal.priority)}`}>
                                    {deal.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{deal.customerName}</p>
                                <div className="text-xs text-gray-500 mb-2">{deal.employeeName}</div>
                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-lg font-semibold text-gray-900">
                                    ${deal.value.toLocaleString()}
                                  </p>
                                  <span className="text-xs text-gray-500">
                                    {new Date(deal.lastContactDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
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
