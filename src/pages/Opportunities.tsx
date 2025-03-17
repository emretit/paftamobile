
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import OpportunitiesHeader from "@/components/opportunities/OpportunitiesHeader";
import OpportunitiesKanban from "@/components/opportunities/OpportunitiesKanban";
import OpportunityDetailSheet from "@/components/opportunities/OpportunityDetailSheet";
import OpportunityBulkActions from "@/components/opportunities/OpportunityBulkActions";
import OpportunityFilters from "@/components/opportunities/OpportunityFilters";
import { useOpportunities } from "@/hooks/useOpportunities";
import { OpportunityExtended } from "@/types/crm";

interface OpportunitiesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

// Define the opportunities state structure
export interface OpportunitiesStateType {
  new: OpportunityExtended[];
  first_contact: OpportunityExtended[];
  site_visit: OpportunityExtended[];
  preparing_proposal: OpportunityExtended[];
  proposal_sent: OpportunityExtended[];
  accepted: OpportunityExtended[];
  lost: OpportunityExtended[];
}

const Opportunities = ({ isCollapsed, setIsCollapsed }: OpportunitiesProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  
  const {
    opportunities,
    isLoading,
    error,
    selectedOpportunity,
    isDetailOpen,
    selectedItems,
    handleDragEnd,
    handleSelectOpportunity,
    handleSelectItem,
    handleBulkStatusUpdate,
    setIsDetailOpen,
    setSelectedItems
  } = useOpportunities(searchQuery, selectedEmployee, selectedCustomer);

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main 
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-[60px]' : 'ml-[60px] sm:ml-64'
        }`}
      >
        <TopBar />
        <div className="p-6">
          <OpportunitiesHeader />
          
          <OpportunityFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <p>Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-96 text-red-500">
              <p>Fırsatlar yüklenirken bir hata oluştu.</p>
            </div>
          ) : (
            <OpportunitiesKanban
              opportunities={opportunities as OpportunitiesStateType}
              onDragEnd={handleDragEnd}
              onOpportunityClick={handleSelectOpportunity}
              onOpportunitySelect={handleSelectItem}
              selectedOpportunities={selectedItems}
            />
          )}
          
          <OpportunityDetailSheet
            opportunity={selectedOpportunity}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
          />

          <OpportunityBulkActions
            selectedOpportunities={selectedItems}
            onUpdateStatus={handleBulkStatusUpdate}
            onClearSelection={() => setSelectedItems([])}
          />
        </div>
      </main>
    </div>
  );
};

export default Opportunities;
