import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus, LayoutGrid, Table as TableIcon } from "lucide-react";
import { ProposalFilters as ProposalFiltersType } from "@/components/proposals/ProposalFilters";
import { ProposalActions } from "@/components/proposals/ProposalActions";
import ProposalTable from "@/components/proposals/ProposalTable";
import { ProposalKanban } from "@/components/proposals/ProposalKanban";
import { ProposalDetailSheet } from "@/components/proposals/ProposalDetailSheet";
import { useProposals } from "@/hooks/useProposals";
import type { Proposal } from "@/types/proposal";

type ViewType = "kanban" | "table";

interface ProposalsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (value: boolean) => void }) => {
  const [activeView, setActiveView] = useState<ViewType>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const [filters, setFilters] = useState<ProposalFiltersType>({
    search: "",
    status: "all",
    dateRange: {
      from: null,
      to: null,
    },
    employeeId: null,
  });

  const { proposals, isLoading } = useProposals(filters);

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDetailSheetOpen(true);
  };

  const getViewComponent = () => {
    switch (activeView) {
      case "table":
        return <ProposalTable filters={filters} onProposalSelect={handleSelectProposal} />;
      case "kanban":
      default:
        return <ProposalKanban proposals={proposals || []} onProposalSelect={handleSelectProposal} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main 
        className={`transition-all duration-300 ${
          isCollapsed ? 'ml-[60px]' : 'ml-64'
        }`}
      >
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teklifler</h1>
              <p className="text-gray-600 mt-1">Tüm teklifleri görüntüleyin ve yönetin</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-white border rounded-md p-1 flex items-center">
                <Button 
                  variant={activeView === "kanban" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveView("kanban")}
                  className="px-3"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </Button>
                <Button 
                  variant={activeView === "table" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveView("table")}
                  className="px-3"
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Tablo
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  window.location.href = "/proposals/new";
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Teklif Ekle
              </Button>
            </div>
          </div>

          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Teklif ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFilters(prev => ({ ...prev, search: e.target.value }));
                }}
                className="flex-1"
              />
              <Select
                value={selectedStatus || "all"}
                onValueChange={(value) => {
                  setSelectedStatus(value === "all" ? null : value);
                  setFilters(prev => ({ ...prev, status: value }));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Durum seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="discovery_scheduled">Planlandı</SelectItem>
                  <SelectItem value="meeting_completed">Keşif Tamamlandı</SelectItem>
                  <SelectItem value="quote_in_progress">Hazırlanıyor</SelectItem>
                  <SelectItem value="quote_sent">Gönderildi</SelectItem>
                  <SelectItem value="negotiation">Müzakerede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                  <SelectItem value="converted_to_order">Sipariş Oldu</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedEmployee || "all"}
                onValueChange={(value) => {
                  setSelectedEmployee(value === "all" ? null : value);
                  setFilters(prev => ({ ...prev, employeeId: value === "all" ? null : value }));
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Satış Temsilcisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {/* Here you would map through employees */}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <ScrollArea className="h-[calc(100vh-280px)]">
            {getViewComponent()}
          </ScrollArea>
        </div>

        <ProposalDetailSheet 
          proposal={selectedProposal}
          isOpen={isDetailSheetOpen}
          onClose={() => {
            setIsDetailSheetOpen(false);
            setSelectedProposal(null);
          }}
        />
      </main>
    </div>
  );
};

export default Proposals;
