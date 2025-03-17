
import { useState, useEffect } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useToast } from "@/components/ui/use-toast";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import OpportunitiesKanban from "@/components/opportunities/OpportunitiesKanban";
import OpportunitiesHeader from "@/components/opportunities/OpportunitiesHeader";
import OpportunityFilterBar from "@/components/opportunities/OpportunityFilterBar";
import OpportunityDetailSheet from "@/components/opportunities/OpportunityDetailSheet";
import OpportunityBulkActions from "@/components/opportunities/OpportunityBulkActions";

interface OpportunitiesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Opportunities = ({ isCollapsed, setIsCollapsed }: OpportunitiesProps) => {
  const { toast } = useToast();
  const { 
    data: opportunitiesData,
    isLoading, 
    error,
    updateOpportunityStatus,
    invalidateOpportunities
  } = useOpportunities();
  
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Opportunity[]>([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  
  // Group opportunities by status
  const groupedOpportunities = {
    new: (opportunitiesData || [])
      .filter(opp => opp.status === "new" && filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    first_contact: (opportunitiesData || [])
      .filter(opp => opp.status === "first_contact" && filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    site_visit: (opportunitiesData || [])
      .filter(opp => opp.status === "site_visit" && filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    preparing_proposal: (opportunitiesData || [])
      .filter(opp => opp.status === "preparing_proposal" && filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    proposal_sent: (opportunitiesData || [])
      .filter(opp => opp.status === "proposal_sent" && filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    accepted: (opportunitiesData || [])
      .filter(opp => opp.status === "accepted" && filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    lost: (opportunitiesData || [])
      .filter(opp => opp.status === "lost" && filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
  };
  
  function filterOpportunity(opportunity: Opportunity): boolean {
    // Filter by keyword
    const keywordMatch = !filterKeyword || 
      opportunity.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      (opportunity.description?.toLowerCase() || "").includes(filterKeyword.toLowerCase()) ||
      (opportunity.customer?.name?.toLowerCase() || "").includes(filterKeyword.toLowerCase());
    
    // Filter by status
    const statusMatch = statusFilter === "all" || opportunity.status === statusFilter;
    
    // Filter by priority
    const priorityMatch = !priorityFilter || opportunity.priority === priorityFilter;
    
    return keywordMatch && statusMatch && priorityMatch;
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Dropped outside the list
    if (!destination) return;
    
    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    // Find the opportunity
    const opportunity = opportunitiesData?.find(opp => opp.id === draggableId);
    if (!opportunity) return;
    
    // Update opportunity status
    try {
      await updateOpportunityStatus(
        opportunity.id, 
        destination.droppableId as OpportunityStatus
      );
      
      toast({
        title: "Durum güncellendi",
        description: `Fırsat durumu "${destination.droppableId}" olarak değiştirildi.`,
      });
    } catch (error) {
      console.error("Error updating opportunity status:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Fırsat durumu güncellenirken bir hata oluştu.",
      });
    }
  };
  
  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
  };
  
  const handleOpportunitySelect = (opportunity: Opportunity) => {
    setSelectedOpportunities(prev => {
      const isSelected = prev.some(o => o.id === opportunity.id);
      return isSelected 
        ? prev.filter(o => o.id !== opportunity.id) 
        : [...prev, opportunity];
    });
  };
  
  const handleClearSelection = () => {
    setSelectedOpportunities([]);
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Fırsatlar"
      subtitle="Tüm satış fırsatlarını yönetin"
    >
      <div className="space-y-6">
        <OpportunitiesHeader />
        
        <OpportunityFilterBar 
          keyword={filterKeyword}
          setKeyword={setFilterKeyword}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />
        
        {selectedOpportunities.length > 0 && (
          <OpportunityBulkActions 
            selectedCount={selectedOpportunities.length}
            onClearSelection={handleClearSelection}
          />
        )}
        
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-red-500">Fırsatlar yüklenirken bir hata oluştu</div>
          </div>
        ) : (
          <OpportunitiesKanban
            opportunities={groupedOpportunities}
            onDragEnd={handleDragEnd}
            onOpportunityClick={handleOpportunityClick}
            onOpportunitySelect={handleOpportunitySelect}
            selectedOpportunities={selectedOpportunities}
          />
        )}
      </div>
      
      {selectedOpportunity && (
        <OpportunityDetailSheet
          opportunity={selectedOpportunity}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setTimeout(() => setSelectedOpportunity(null), 300);
          }}
          onOpportunityUpdate={() => {
            invalidateOpportunities();
          }}
        />
      )}
    </DefaultLayout>
  );
};

export default Opportunities;
