
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useProposals } from "@/hooks/useProposals";
import Navbar from "@/components/Navbar";
import { ProposalActions } from "@/components/proposals/ProposalActions";
import ProposalTable from "@/components/proposals/ProposalTable";
import { ProposalFilters, ProposalFilters as ProposalFiltersType } from "@/components/proposals/ProposalFilters";
import { Proposal } from "@/types/proposal";
import { ProposalDetailSheet } from "@/components/proposals/ProposalDetailSheet";

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
  
  // Call useProposals without applying any filters
  const { data: proposals } = useProposals();

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
              Müşteri ve tedarikçi tekliflerinizi yönetin
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <ProposalFilters onFilterChange={handleFilterChange} />
            </CardContent>
          </Card>

          <div className="mb-4">
            <ProposalActions proposal={null} />
          </div>

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
