
import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";
import { ProposalTable } from "@/components/proposals/ProposalTable";
import { ProposalAnalytics } from "@/components/proposals/ProposalAnalytics";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";
import { ProposalActions } from "@/components/proposals/ProposalActions";
import { ProposalKanban } from "@/components/proposals/ProposalKanban";

interface ProposalsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'ml-[60px]' : 'ml-64'
      }`}>
        <TopBar />
        <main className="p-6">
          <ProposalActions />
          <ProposalAnalytics />
          <ProposalFilters />
          <ProposalTable />
          <ProposalKanban />
        </main>
      </div>
    </div>
  );
};

export default Proposals;
