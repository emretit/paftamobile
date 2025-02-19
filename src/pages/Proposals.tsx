
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import { ProposalAnalytics } from "@/components/proposals/ProposalAnalytics";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";
import { ProposalActions } from "@/components/proposals/ProposalActions";
import ProposalTable from "@/components/proposals/ProposalTable";
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
    <div className="min-h-screen bg-gray-50 flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main 
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-[60px]' : 'ml-[60px] sm:ml-64'
        }`}
      >
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Teklifler</h1>
            <p className="text-gray-600 mt-1">Tüm teklifleri görüntüleyin ve yönetin</p>
          </div>

          <div className="space-y-6">
            <ProposalActions proposal={null} />
            <ProposalAnalytics />
            <ProposalFilters onFilterChange={setFilters} />
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4">
                <ProposalTable />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Proposals;
