
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import ProposalTable from "@/components/proposals/ProposalTable";
import { ProposalAnalytics } from "@/components/proposals/ProposalAnalytics";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";
import { ProposalActions } from "@/components/proposals/ProposalActions";
import ProposalKanban from "@/components/proposals/ProposalKanban";
import { useState } from "react";
import { ProposalFilters as ProposalFiltersType } from "@/components/proposals/ProposalFilters";

interface ProposalsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsProps) => {
  const [filters, setFilters] = useState<ProposalFiltersType>({
    search: "",
    status: "all",
    dateRange: {
      from: null,
      to: null,
    },
    employeeId: null,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'ml-[60px]' : 'ml-64'
      }`}>
        <TopBar />
        <main className="p-6">
          <ProposalActions proposal={null} />
          <ProposalAnalytics />
          <ProposalFilters onFilterChange={setFilters} />
          <ProposalTable filters={filters} />
          <ProposalKanban />
        </main>
      </div>
    </div>
  );
};

export default Proposals;
