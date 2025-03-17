
import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OpportunitiesKanban from "@/components/opportunities/OpportunitiesKanban";
import OpportunityFilters from "@/components/opportunities/OpportunityFilters";
import OpportunityDetailSheet from "@/components/opportunities/OpportunityDetailSheet";
import OpportunityForm from "@/components/opportunities/OpportunityForm";
import OpportunityBulkActions from "@/components/opportunities/OpportunityBulkActions";
import { Opportunity, OpportunityStatus } from "@/types/crm";

interface OpportunitiesPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

type OpportunitiesStateType = {
  new: Opportunity[];
  first_contact: Opportunity[];
  site_visit: Opportunity[];
  preparing_proposal: Opportunity[];
  proposal_sent: Opportunity[];
  accepted: Opportunity[];
  lost: Opportunity[];
};

const Opportunities = ({ isCollapsed, setIsCollapsed }: OpportunitiesPageProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Opportunity[]>([]);
  
  // Sample data - in real app would be fetched from API
  const [opportunities, setOpportunities] = useState<OpportunitiesStateType>({
    new: [
      {
        id: "1",
        title: "Enterprise Software Solution",
        status: "new",
        priority: "high",
        value: 75000,
        customer_id: "1",
        employee_id: "1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer_name: "Tech Corp",
        employee_name: "John Smith"
      }
    ],
    first_contact: [],
    site_visit: [],
    preparing_proposal: [],
    proposal_sent: [],
    accepted: [],
    lost: []
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    // Create a copy of the current opportunities state
    const newOpportunities = { ...opportunities };
    
    // Find the opportunity in the source column
    const sourceStatus = source.droppableId as OpportunityStatus;
    const opportunity = opportunities[sourceStatus].find(o => o.id === draggableId);
    
    if (!opportunity) return;
    
    // Remove from source and add to destination
    newOpportunities[sourceStatus] = newOpportunities[sourceStatus].filter(o => o.id !== draggableId);
    
    const destStatus = destination.droppableId as OpportunityStatus;
    const updatedOpportunity = { ...opportunity, status: destStatus };
    
    newOpportunities[destStatus] = [
      ...newOpportunities[destStatus].slice(0, destination.index),
      updatedOpportunity,
      ...newOpportunities[destStatus].slice(destination.index)
    ];
    
    setOpportunities(newOpportunities);
    toast.success(`${opportunity.title} durumu güncellendi: ${destStatus.replace('_', ' ')}`);
  };

  const handleOpportunitySelect = (opportunity: Opportunity) => {
    setSelectedOpportunities(prev => {
      if (prev.some(o => o.id === opportunity.id)) {
        return prev.filter(o => o.id !== opportunity.id);
      }
      return [...prev, opportunity];
    });
  };

  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
  };

  const handleBulkStatusUpdate = (opportunities: Opportunity[], newStatus: OpportunityStatus) => {
    setOpportunities(prev => {
      const next = { ...prev };
      
      opportunities.forEach(opportunity => {
        const currentStatus = opportunity.status as OpportunityStatus;
        next[currentStatus] = next[currentStatus].filter(o => o.id !== opportunity.id);
        next[newStatus] = [...next[newStatus], { ...opportunity, status: newStatus }];
      });
      
      return next;
    });
    
    setSelectedOpportunities([]);
    toast.success(`${opportunities.length} fırsat durumu güncellendi`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fırsatlar</h1>
              <p className="text-gray-600">
                Tüm satış fırsatlarını yönetin ve takip edin
              </p>
            </div>
            
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-red-800 hover:bg-red-900 text-white"
            >
              Yeni Fırsat
            </Button>
          </div>
          
          <OpportunityFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
          />
          
          <OpportunitiesKanban
            opportunities={opportunities as any}
            onDragEnd={handleDragEnd}
            onOpportunityClick={handleOpportunityClick}
            onOpportunitySelect={handleOpportunitySelect}
            selectedOpportunities={selectedOpportunities}
          />
          
          <OpportunityDetailSheet
            opportunity={selectedOpportunity}
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedOpportunity(null);
            }}
          />
          
          <OpportunityForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
          />
          
          <OpportunityBulkActions
            selectedOpportunities={selectedOpportunities}
            onUpdateStatus={handleBulkStatusUpdate}
            onClearSelection={() => setSelectedOpportunities([])}
          />
        </div>
      </main>
    </div>
  );
};

export default Opportunities;
