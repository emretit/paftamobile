
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
import { Proposal, ProposalStatus } from "@/types/proposal";
import { useProposals } from "@/hooks/useProposals";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

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

  // Fetch proposals data
  const { data: proposals = [], isLoading, error } = useProposals({
    status: selectedStatus,
    search: searchQuery,
    dateRange: { from: null, to: null }
  });

  if (error) {
    toast.error("Teklifler yüklenirken bir hata oluştu");
    console.error("Error loading proposals:", error);
  }

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
          </div>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Teklif ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-[200px]">
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
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="this-month">Bu Ay</SelectItem>
                <SelectItem value="last-month">Geçen Ay</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={activeView} onValueChange={setActiveView} className="w-fit">
              <TabsList>
                <TabsTrigger value="list">Liste</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        <Tabs value={activeView} className="w-full">
          <TabsContent value="list" className="mt-0">
            <ProposalTable
              filters={{ 
                status: selectedStatus, 
                search: searchQuery,
                dateRange: { from: null, to: null }
              }}
              onProposalSelect={handleRowClick}
            />
          </TabsContent>
          <TabsContent value="kanban" className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-t-blue-600 border-b-blue-600 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Teklifler yükleniyor...</p>
                </div>
              </div>
            ) : (
              <ProposalKanban
                proposals={proposals} 
                onProposalSelect={handleRowClick}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      {selectedProposal && (
        <ProposalDetailSheet 
          proposal={selectedProposal} 
          open={!!selectedProposal} 
          onOpenChange={handleClose} 
        />
      )}
    </DefaultLayout>
  );
};

export default Proposals;
