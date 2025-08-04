
import { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProposalTable from "@/components/proposals/ProposalTable";
import { ProposalKanban } from "@/components/proposals/ProposalKanban";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProposalDetailSheet from "@/components/proposals/ProposalDetailSheet";
import { Proposal } from "@/types/proposal";
import { useProposals } from "@/hooks/useProposals";
import { toast } from "sonner";
import ProposalsViewToggle from "@/components/proposals/header/ProposalsViewToggle";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProposalsPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Proposals = ({ isCollapsed, setIsCollapsed }: ProposalsPageProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [activeView, setActiveView] = useState<"list" | "kanban">("list");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Fetch employees data
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('status', 'aktif')
        .order('first_name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch proposals data
  const { data: proposals = [], isLoading, error } = useProposals({
    status: selectedStatus,
    search: searchQuery,
    employeeId: selectedEmployee,
    dateRange: { from: null, to: null }
  });

  if (error) {
    toast.error("Teklifler yüklenirken bir hata oluştu");
    console.error("Error loading proposals:", error);
  }

  const handleProposalSelect = (proposal: Proposal) => {
    setSelectedProposal(proposal);
  };

  const handleCloseDetail = () => {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Teklifler</h1>
            <p className="text-muted-foreground">Tüm teklifleri görüntüleyin ve yönetin</p>
          </div>
          <div className="flex gap-2">
            <ProposalsViewToggle 
              activeView={activeView} 
              setActiveView={setActiveView} 
            />
            <Button 
              variant="outline" 
              onClick={() => navigate("/proposals/templates")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Şablonla Oluştur
            </Button>
            <Button onClick={() => navigate("/proposal/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Hızlı Teklif
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Teklif no, müşteri adı veya başlık ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="draft">📄 Taslak</SelectItem>
              <SelectItem value="pending_approval">⏳ Onay Bekliyor</SelectItem>
              <SelectItem value="sent">📤 Gönderildi</SelectItem>
              <SelectItem value="accepted">✅ Kabul Edildi</SelectItem>
              <SelectItem value="rejected">❌ Reddedildi</SelectItem>
              <SelectItem value="expired">⚠️ Süresi Dolmuş</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <User className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Satış Temsilcisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Temsilciler</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Teklifler yükleniyor...</p>
            </div>
          </div>
        ) : activeView === "list" ? (
          <ProposalTable
            filters={{ 
              status: selectedStatus, 
              search: searchQuery,
              employeeId: selectedEmployee,
              dateRange: { from: null, to: null }
            }}
            onProposalSelect={handleProposalSelect}
          />
        ) : (
          <ProposalKanban
            proposals={proposals} 
            onProposalSelect={handleProposalSelect}
          />
        )}
      </div>

      {/* Detail Sheet */}
      {selectedProposal && (
        <ProposalDetailSheet 
          proposal={selectedProposal} 
          open={!!selectedProposal} 
          onOpenChange={handleCloseDetail} 
        />
      )}
    </DefaultLayout>
  );
};

export default Proposals;
