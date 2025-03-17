import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { ArrowLeft, Edit, Send, Printer, Trash, Save } from "lucide-react";
import { useProposalStatusUpdate } from "@/hooks/useProposalStatusUpdate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ProposalDetailsTab } from "@/components/proposals/detail/ProposalDetailsTab";
import { ProposalItemsTab } from "@/components/proposals/detail/ProposalItemsTab";
import { ProposalNotesTab } from "@/components/proposals/detail/ProposalNotesTab";
import { ProposalAttachmentsTab } from "@/components/proposals/detail/ProposalAttachmentsTab";
import { primaryProposalStatuses, statusLabels } from "@/components/proposals/constants";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { StatusBadge } from "@/components/proposals/detail/StatusBadge";

interface ProposalDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalDetails = ({ isCollapsed, setIsCollapsed }: ProposalDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStatus, setCurrentStatus] = useState<ProposalStatus | null>(null);
  const { updateProposalStatus, isUpdating } = useProposalStatusUpdate();
  
  // Fetch the proposal data
  const { data: proposal, isLoading, error } = useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      try {
        // First get the proposal
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', id)
          .single();
          
        if (proposalError) throw proposalError;
        
        // Fetch related customer if exists
        let customerData = null;
        if (proposalData.customer_id) {
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('id', proposalData.customer_id)
            .single();
            
          if (!customerError) {
            customerData = customer;
          }
        }
        
        // Fetch related employee if exists
        let employeeData = null;
        if (proposalData.employee_id) {
          const { data: employee, error: employeeError } = await supabase
            .from('employees')
            .select('*')
            .eq('id', proposalData.employee_id)
            .single();
            
          if (!employeeError) {
            employeeData = employee;
          }
        }
        
        // Transform any potential 'files' field to 'attachments' for compatibility
        const transformedData = {
          ...proposalData,
          customer: customerData,
          employee: employeeData ? {
            id: employeeData.id,
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
            email: employeeData.email
          } : null,
          attachments: proposalData.files ? (typeof proposalData.files === 'string' ? JSON.parse(proposalData.files) : proposalData.files) : []
        };
        
        return transformedData as unknown as Proposal;
      } catch (error) {
        console.error('Error fetching proposal:', error);
        throw error;
      }
    },
    enabled: !!id
  });
  
  // Set up realtime subscription for this specific proposal
  useEffect(() => {
    if (!id) return;
    
    const channel = supabase
      .channel(`proposal-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proposals',
          filter: `id=eq.${id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['proposal', id] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);
  
  // Update local status state when proposal data changes
  useEffect(() => {
    if (proposal && proposal.status !== currentStatus) {
      setCurrentStatus(proposal.status as ProposalStatus);
    }
  }, [proposal]);
  
  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as ProposalStatus);
  };
  
  const handleSaveStatus = async () => {
    if (!proposal || !currentStatus || currentStatus === proposal.status) return;
    
    try {
      await updateProposalStatus.mutateAsync({
        proposalId: proposal.id,
        status: currentStatus,
        opportunityId: proposal.opportunity_id
      });
    } catch (error) {
      toast.error("Durum güncellenirken bir hata oluştu");
      console.error("Error updating status:", error);
    }
  };
  
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main
          className={`flex-1 transition-all duration-300 ${
            isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
          }`}
        >
          <TopBar />
          <div className="p-6">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4 mb-6"></div>
            <Card className="border-red-100 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main
          className={`flex-1 transition-all duration-300 ${
            isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
          }`}
        >
          <TopBar />
          <div className="p-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/proposals')}
              className="mb-6 border-red-200 text-red-700 hover:bg-red-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
            
            <Card className="border-red-100 shadow-sm">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-red-800 mb-2">Teklif bulunamadı</h3>
                <p className="text-gray-500 mb-4">İstediğiniz teklif bulunamadı veya erişim iznine sahip değilsiniz.</p>
                <Button 
                  onClick={() => navigate('/proposals')}
                  className="bg-red-800 hover:bg-red-900"
                >
                  Teklifler Sayfasına Dön
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-6">
          {/* Header with back button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate('/proposals')}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold text-red-900">{proposal.title}</h1>
                <StatusBadge status={proposal.status} />
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <span>Teklif #{proposal.proposal_number}</span>
                <span>•</span>
                <span>Oluşturma: {formatDate(proposal.created_at)}</span>
                {proposal.sent_date && (
                  <>
                    <span>•</span>
                    <span>Gönderim: {formatDate(proposal.sent_date)}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Button 
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Printer className="mr-2 h-4 w-4" />
                Yazdır
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/proposals/edit/${proposal.id}`)}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
            </div>
          </div>
          
          {/* Status change section */}
          <Card className="mb-6 border-red-100 shadow-sm bg-gradient-to-r from-red-50 to-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 max-w-md">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Teklif Durumu</h3>
                  <Select 
                    value={currentStatus || proposal.status} 
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full border-red-200 focus:ring-red-200">
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryProposalStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 self-end md:self-auto">
                  <Button 
                    variant="outline"
                    onClick={handleSaveStatus}
                    disabled={isUpdating || currentStatus === proposal.status}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                  
                  {currentStatus !== ('gonderildi' as ProposalStatus) && (
                    <Button 
                      onClick={() => {
                        setCurrentStatus('gonderildi' as ProposalStatus);
                        setTimeout(() => {
                          handleSaveStatus();
                        }, 100);
                      }}
                      disabled={isUpdating || currentStatus === ('gonderildi' as ProposalStatus)}
                      className="bg-red-800 hover:bg-red-900"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Teklifi Gönder
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs */}
          <Card className="border-red-100 shadow-sm">
            <CardContent className="p-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6 bg-red-100/50">
                  <TabsTrigger 
                    value="details"
                    className="data-[state=active]:bg-red-200 data-[state=active]:text-red-900"
                  >
                    Detaylar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="items"
                    className="data-[state=active]:bg-red-200 data-[state=active]:text-red-900"
                  >
                    Ürünler
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes"
                    className="data-[state=active]:bg-red-200 data-[state=active]:text-red-900"
                  >
                    Notlar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="attachments"
                    className="data-[state=active]:bg-red-200 data-[state=active]:text-red-900"
                  >
                    Ekler
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <ProposalDetailsTab proposal={proposal} />
                </TabsContent>
                
                <TabsContent value="items">
                  <ProposalItemsTab proposal={proposal} />
                </TabsContent>
                
                <TabsContent value="notes">
                  <ProposalNotesTab proposal={proposal} />
                </TabsContent>
                
                <TabsContent value="attachments">
                  <ProposalAttachmentsTab proposal={proposal} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProposalDetails;
