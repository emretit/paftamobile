
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOpportunities } from "@/hooks/useOpportunities";
import { Opportunity, OpportunityStatus, opportunityStatusLabels } from "@/types/crm";
import OpportunityKanban from "@/components/opportunities/OpportunityKanban";
import OpportunityFilters from "@/components/opportunities/OpportunityFilters";
import OpportunityDetailSheet from "@/components/opportunities/OpportunityDetailSheet";
import { Plus, Filter } from "lucide-react";

interface OpportunitiesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Opportunities = ({ isCollapsed, setIsCollapsed }: OpportunitiesProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: 'all' as OpportunityStatus | 'all',
    search: '',
    employeeId: undefined as string | undefined,
    customerId: undefined as string | undefined
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const { 
    opportunities, 
    isLoading, 
    updateOpportunityStatus 
  } = useOpportunities(filters);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleStatusChange = async (opportunityId: string, newStatus: OpportunityStatus) => {
    await updateOpportunityStatus.mutateAsync({ 
      id: opportunityId, 
      status: newStatus 
    });
  };

  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailSheetOpen(true);
  };

  const handleCloseDetailSheet = () => {
    setIsDetailSheetOpen(false);
    setSelectedOpportunity(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fırsatlar</h1>
              <p className="text-gray-600 mt-1">
                Tüm satış fırsatlarını görüntüleyin ve yönetin
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate("/opportunities/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Fırsat Ekle
              </Button>
            </div>
          </div>

          {isFilterOpen && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <OpportunityFilters 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                />
              </CardContent>
            </Card>
          )}

          <OpportunityKanban 
            opportunities={opportunities} 
            isLoading={isLoading}
            onOpportunityClick={handleOpportunityClick}
            onStatusChange={handleStatusChange}
          />

          <OpportunityDetailSheet
            opportunity={selectedOpportunity}
            isOpen={isDetailSheetOpen}
            onClose={handleCloseDetailSheet}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>
    </div>
  );
};

export default Opportunities;
