
import { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProposalTable from "@/components/proposals/ProposalTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalKanban } from "@/components/proposals/ProposalKanban";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProposalDetailSheet from "@/components/proposals/ProposalDetailSheet";
import { Proposal } from "@/types/proposal";

interface ProposalsPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsPageProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeView, setActiveView] = useState<string>("list");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const handleRowClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleClose = () => {
    setSelectedProposal(null);
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklifler"
      subtitle="Müşterilerinize gönderdiğiniz teklifleri yönetin"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teklifler</h1>
          <div className="flex space-x-2">
            <Button onClick={() => navigate("/proposal/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Teklif
            </Button>
            <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtreler
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Teklif ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tüm Durumlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="pending_approval">Onay Bekliyor</SelectItem>
                <SelectItem value="sent">Gönderildi</SelectItem>
                <SelectItem value="accepted">Kabul Edildi</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
                <SelectItem value="expired">Süresi Dolmuş</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Tabs value={activeView} onValueChange={setActiveView} className="w-fit">
            <TabsList>
              <TabsTrigger value="list">Liste</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeView} className="w-full">
          <TabsContent value="list" className="mt-0">
            <ProposalTable
              searchQuery={searchQuery}
              status={selectedStatus}
              onRowClick={handleRowClick}
            />
          </TabsContent>
          <TabsContent value="kanban" className="mt-0">
            <ProposalKanban
              onSelectProposal={handleRowClick}
            />
          </TabsContent>
        </Tabs>
      </div>
      {selectedProposal && (
        <ProposalDetailSheet 
          proposal={selectedProposal} 
          open={!!selectedProposal} 
          handleClose={handleClose} 
        />
      )}
    </DefaultLayout>
  );
};

export default Proposals;
