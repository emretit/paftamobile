
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalDetailsTab } from "./detail/ProposalDetailsTab";
import { ProposalItemsTab } from "./detail/ProposalItemsTab";
import { ProposalNotesTab } from "./detail/ProposalNotesTab";
import { StatusBadge } from "./detail/StatusBadge";
import { useProposals } from "@/hooks/useProposals";
import { Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet = ({ proposal, isOpen, onClose }: ProposalDetailSheetProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { data, refetch } = useProposals({ status: "all" });
  const navigate = useNavigate();

  const updateProposal = async (id: string, newStatus: ProposalStatus, notes?: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ 
          status: newStatus,
          ...(notes && { internal_notes: notes })
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Teklif başarıyla güncellendi');
      refetch();
    } catch (error) {
      console.error("Error updating proposal status:", error);
      toast.error('Teklif güncellenirken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: ProposalStatus) => {
    if (!proposal) return;
    await updateProposal(proposal.id, newStatus);
  };

  const handleNotesChange = async (notes: string) => {
    if (!proposal) return;
    await updateProposal(proposal.id, proposal.status as ProposalStatus, notes);
  };

  const handleViewFullDetails = () => {
    if (proposal) {
      navigate(`/proposals/detail/${proposal.id}`);
      onClose();
    }
  };

  if (!proposal) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-y-auto">
        <SheetHeader className="flex flex-row justify-between items-center">
          <div>
            <SheetTitle className="text-xl">{proposal.title}</SheetTitle>
            <div className="flex items-center mt-1 text-muted-foreground">
              <span className="mr-2">Teklif #{proposal.proposal_number}</span>
              <StatusBadge status={proposal.status} />
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewFullDetails} 
            className="ml-auto"
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Tam Görünüm
          </Button>
        </SheetHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="items">Ürünler</TabsTrigger>
            <TabsTrigger value="notes">Notlar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <ProposalDetailsTab 
              proposal={proposal} 
              onStatusChange={handleStatusChange}
              isUpdating={isUpdating}
              onNotesChange={handleNotesChange}
            />
          </TabsContent>
          
          <TabsContent value="items">
            <ProposalItemsTab proposal={proposal} />
          </TabsContent>
          
          <TabsContent value="notes">
            <ProposalNotesTab 
              proposal={proposal}
              onNotesChange={handleNotesChange}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
