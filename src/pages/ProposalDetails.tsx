
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Clock, Loader2, UserCheck, Building, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalStatusShared } from "@/types/shared-types";
import StatusBadge from "@/components/proposals/detail/StatusBadge";
import ProposalItems from "@/components/proposals/detail/ProposalItems";
import ProposalAttachments from "@/components/proposals/detail/ProposalAttachments";
import { proposalStatusLabels } from "@/components/proposals/constants";
import { cn } from "@/lib/utils";

interface ProposalDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalDetails = ({ isCollapsed, setIsCollapsed }: ProposalDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ProposalStatus>("draft");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch proposal details
  const { data, isLoading, error } = useQuery({
    queryKey: ["proposal", id],
    queryFn: async () => {
      if (!id) throw new Error("No proposal ID provided");
      
      const { data: proposal, error } = await supabase
        .from("proposals")
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      // Initialize status state with current proposal status
      if (proposal) {
        setStatus(proposal.status as ProposalStatus);
      }
      
      return proposal as unknown as Proposal;
    },
  });
  
  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async (newStatus: ProposalStatus) => {
      setIsUpdating(true);
      const { error } = await supabase
        .from("proposals")
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["proposal", id] });
      toast.success(`Teklif durumu güncellendi: ${proposalStatusLabels[newStatus as keyof typeof proposalStatusLabels]}`);
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error("Durum güncellenirken bir hata oluştu");
      console.error("Error updating proposal status:", error);
      // Reset status to current proposal status
      if (data) setStatus(data.status as ProposalStatus);
      setIsUpdating(false);
    }
  });
  
  const handleStatusChange = (newStatus: ProposalStatus) => {
    if (newStatus === status) return;
    
    setStatus(newStatus);
    statusMutation.mutate(newStatus);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Teklif bulunamadı</h2>
        <p className="text-gray-600 mb-6">
          İstediğiniz teklif detaylarına ulaşılamadı. Teklif silinmiş veya erişim yetkiniz olmayabilir.
        </p>
        <Button onClick={() => navigate("/proposals")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tekliflere Dön
        </Button>
      </div>
    );
  }
  
  const proposal = data;
  const formattedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: proposal.currency || 'TRY' })
    .format(proposal.total_value);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/proposals")}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tekliflere Dön
        </Button>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 mr-2">Teklif Durumu:</span>
          <StatusBadge status={status} size="lg" />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as ProposalStatus)}
            className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isUpdating}
          >
            {Object.entries(proposalStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {isUpdating && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{proposal.title}</CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    Teklif #{proposal.proposal_number}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{formattedTotal}</div>
                  <div className="text-sm text-gray-500">
                    {proposal.currency || "TRY"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm">
                    <UserCheck className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Sorumlu:</span>
                    <span className="ml-2">
                      {proposal.employee ? 
                        `${proposal.employee.first_name} ${proposal.employee.last_name}` : 
                        "Atanmamış"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Müşteri:</span>
                    <span className="ml-2">
                      {proposal.customer ? 
                        proposal.customer.name : 
                        "Belirtilmemiş"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Oluşturma:</span>
                    <span className="ml-2">
                      {format(new Date(proposal.created_at), 'PPP', { locale: tr })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Geçerlilik:</span>
                    <span className={cn("ml-2", 
                      proposal.valid_until && new Date(proposal.valid_until) < new Date() ? 
                      "text-red-600 font-medium" : ""
                    )}>
                      {proposal.valid_until ? 
                        format(new Date(proposal.valid_until), 'PPP', { locale: tr }) : 
                        "Belirtilmemiş"}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <Tabs defaultValue="items">
                <TabsList className="mb-6">
                  <TabsTrigger value="items">Kalemler</TabsTrigger>
                  <TabsTrigger value="files">Dosyalar</TabsTrigger>
                  <TabsTrigger value="notes">Notlar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items" className="space-y-4">
                  <ProposalItems proposalId={proposal.id} />
                </TabsContent>
                
                <TabsContent value="files">
                  <ProposalAttachments 
                    proposalId={proposal.id} 
                    attachments={proposal.attachments || []} 
                  />
                </TabsContent>
                
                <TabsContent value="notes">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {proposal.internal_notes ? (
                      <p className="whitespace-pre-line">{proposal.internal_notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">Bu teklif için not eklenmemiş.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start"
                disabled={isUpdating}
                onClick={() => handleStatusChange('draft' as ProposalStatus)}
              >
                <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                Taslak
              </Button>
              
              <Button 
                className="w-full justify-start"
                disabled={isUpdating}
                onClick={() => handleStatusChange('pending_approval' as ProposalStatus)}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Onay Bekliyor
              </Button>
              
              <Button 
                className="w-full justify-start"
                disabled={isUpdating}
                onClick={() => handleStatusChange('sent' as ProposalStatus)}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                Gönderildi
              </Button>
              
              <Button 
                className="w-full justify-start bg-green-600 hover:bg-green-700"
                disabled={isUpdating}
                onClick={() => handleStatusChange('accepted' as ProposalStatus)}
              >
                <span className="w-2 h-2 rounded-full bg-white mr-2"></span>
                Kabul Edildi
              </Button>
              
              <Button 
                variant="outline"
                className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                disabled={isUpdating}
                onClick={() => handleStatusChange('rejected' as ProposalStatus)}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                Reddedildi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails;
