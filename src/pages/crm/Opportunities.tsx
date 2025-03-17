
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
import OpportunitiesContent from "@/components/opportunities/OpportunitiesContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OpportunitiesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Opportunities = ({ isCollapsed, setIsCollapsed }: OpportunitiesProps) => {
  const { toast } = useToast();
  const { 
    opportunities,
    isLoading, 
    error,
    handleDragEnd,
    handleUpdateOpportunity,
    selectedOpportunity,
    setSelectedOpportunity,
    isDetailOpen,
    setIsDetailOpen
  } = useOpportunities();
  
  const [selectedOpportunities, setSelectedOpportunities] = useState<Opportunity[]>([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("kanban");
  
  // Group opportunities by status
  const groupedOpportunities = {
    new: (opportunities.new || [])
      .filter(opp => filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    first_contact: (opportunities.first_contact || [])
      .filter(opp => filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    site_visit: (opportunities.site_visit || [])
      .filter(opp => filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    preparing_proposal: (opportunities.preparing_proposal || [])
      .filter(opp => filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    proposal_sent: (opportunities.proposal_sent || [])
      .filter(opp => filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    accepted: (opportunities.accepted || [])
      .filter(opp => filterOpportunity(opp))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    lost: (opportunities.lost || [])
      .filter(opp => filterOpportunity(opp))
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
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <OpportunityFilterBar 
            filterKeyword={filterKeyword}
            setFilterKeyword={setFilterKeyword}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
          />
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className="w-fit"
          >
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {selectedOpportunities.length > 0 && (
          <OpportunityBulkActions 
            selectedOpportunities={selectedOpportunities}
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
          <Tabs value={activeView} className="w-full">
            <TabsContent value="kanban" className="mt-0">
              <OpportunitiesKanban
                opportunities={groupedOpportunities}
                onDragEnd={handleDragEnd}
                onOpportunityClick={handleOpportunityClick}
                onOpportunitySelect={handleOpportunitySelect}
                selectedOpportunities={selectedOpportunities}
              />
            </TabsContent>
            <TabsContent value="list" className="mt-0">
              <OpportunitiesContent
                opportunities={groupedOpportunities}
                isLoading={isLoading}
                error={error}
                onSelectOpportunity={handleOpportunityClick}
                searchQuery={filterKeyword}
                statusFilter={statusFilter}
                priorityFilter={priorityFilter}
              />
            </TabsContent>
          </Tabs>
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
          onUpdate={handleUpdateOpportunity}
        />
      )}
    </DefaultLayout>
  );
};

export default Opportunities;
