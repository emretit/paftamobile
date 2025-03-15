
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useProposals } from "@/hooks/useProposals";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";
import { ProposalFilters as ProposalFiltersType } from "@/components/proposals/types";
import { ProposalAnalytics } from "@/components/proposals/ProposalAnalytics";
import ProposalTable from "@/components/proposals/ProposalTable";
import { ProposalDetailSheet } from "@/components/proposals/ProposalDetailSheet";
import { Proposal } from "@/types/proposal";
import { Plus, LayoutGrid, Table, Filter } from "lucide-react";

interface ProposalsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsProps) => {
  // Set empty filters to show all proposals
  const [filters, setFilters] = useState<ProposalFiltersType>({
    search: "",
    status: "all",
    dateRange: {
      from: null,
      to: null,
    },
    employeeId: null,
  });
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  
  // Call useProposals with filters
  const { data: proposals } = useProposals(filters);

  // State for the detail sheet
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const handleFilterChange = (newFilters: ProposalFiltersType) => {
    setFilters(newFilters);
  };

  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailSheetOpen(true);
  };

  const handleCloseDetailSheet = () => {
    setIsDetailSheetOpen(false);
    setSelectedProposal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Teklifler</h1>
            <p className="text-gray-600 mt-1">
              Tüm teklifleri görüntüleyin ve yönetin
            </p>
          </div>

          {/* View mode and actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <Button 
                variant={viewMode === "kanban" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
              <Button 
                variant={viewMode === "table" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <Table className="h-4 w-4 mr-2" />
                Tablo
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate("/proposals/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Teklif Ekle
            </Button>
          </div>

          {/* Analytics component */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Teklif Analizi</h2>
            <ProposalAnalytics />
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <ProposalFilters 
                onSearchChange={(value) => handleFilterChange({...filters, search: value})}
                onStatusChange={(status) => handleFilterChange({...filters, status})}
                selectedStatus={filters.status || "all"}
                onFilterChange={handleFilterChange}
              />
            </CardContent>
          </Card>

          {/* Table View */}
          <Card>
            <CardContent className="p-0">
              <ProposalTable 
                filters={filters} 
                onProposalSelect={handleProposalClick} 
              />
            </CardContent>
          </Card>
          
          {/* Proposal Detail Sheet */}
          <ProposalDetailSheet
            proposal={selectedProposal}
            isOpen={isDetailSheetOpen}
            onClose={handleCloseDetailSheet}
          />
        </div>
      </main>
    </div>
  );
};

export default Proposals;
