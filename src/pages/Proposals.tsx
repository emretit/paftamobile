
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useProposals } from "@/hooks/useProposals";
import Navbar from "@/components/Navbar";
import { ProposalActions } from "@/components/proposals/ProposalActions";
import { ProposalTable } from "@/components/proposals/ProposalTable";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";

const Proposals = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const navigate = useNavigate();
  
  const { data: proposals, isLoading, error } = useProposals({
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
    employeeId: employeeFilter !== "all" ? employeeFilter : undefined,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleEmployeeChange = (employeeId: string) => {
    setEmployeeFilter(employeeId);
  };

  const handleProposalClick = (id: string) => {
    navigate(`/proposals/${id}`);
  };

  const handleNewProposal = () => {
    navigate("/proposal-create");
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
              <ProposalFilters 
                onSearch={handleSearch} 
                onStatusChange={handleFilterChange}
                onEmployeeChange={handleEmployeeChange}
              />
            </CardContent>
          </Card>

          <div className="mb-4">
            <ProposalActions proposal={null} />
          </div>

          <Card>
            <CardContent className="p-0">
              <ProposalTable
                proposals={proposals}
                isLoading={isLoading}
                error={error}
                onProposalClick={handleProposalClick}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Proposals;
