
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalDetailsTab } from "./detail/ProposalDetailsTab";
import { ProposalItemsTab } from "./detail/ProposalItemsTab";
import { ProposalNotesTab } from "./detail/ProposalNotesTab";
import { StatusBadge } from "./detail/StatusBadge";
import { useProposalStatusUpdate } from "@/hooks/useProposalStatusUpdate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Maximize2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { primaryProposalStatuses, statusLabels } from "./constants";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet = ({ proposal, isOpen, onClose }: ProposalDetailSheetProps) => {
  const [currentStatus, setCurrentStatus] = useState<ProposalStatus | null>(null);
  const { updateProposalStatus, isUpdating } = useProposalStatusUpdate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Set the current status when the proposal changes
  if (proposal && proposal.status !== currentStatus) {
    setCurrentStatus(proposal.status as ProposalStatus);
  }

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

  const handleViewFullDetails = () => {
    if (proposal) {
      navigate(`/proposals/detail/${proposal.id}`);
      onClose();
    }
  };

  if (!proposal) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl md:max-w-2xl overflow-y-auto border-l border-red-100 bg-gradient-to-b from-white to-red-50/30">
        <SheetHeader className="text-left border-b pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-xl text-red-900">{proposal.title}</SheetTitle>
              <div className="flex items-center mt-1 text-muted-foreground">
                <span className="mr-2">Teklif #{proposal.proposal_number}</span>
                <StatusBadge status={proposal.status} />
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewFullDetails} 
              className="ml-auto border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              Tam Görünüm
            </Button>
          </div>
          
          <div className="flex items-end justify-between mt-4 pt-4 gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium mb-2 text-red-700">Teklif Durumu</p>
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
            <Button 
              onClick={handleSaveStatus}
              disabled={isUpdating || currentStatus === proposal.status}
              className="bg-red-800 text-white hover:bg-red-900"
            >
              <Save className="mr-2 h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </SheetHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-6 bg-red-100/50">
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
          </TabsList>
          
          <TabsContent value="details">
            <ProposalDetailsTab 
              proposal={proposal} 
              isReadOnly={true}
            />
          </TabsContent>
          
          <TabsContent value="items">
            <ProposalItemsTab proposal={proposal} />
          </TabsContent>
          
          <TabsContent value="notes">
            <ProposalNotesTab 
              proposal={proposal}
              isReadOnly={true}
            />
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="flex justify-end pt-4 mt-6 border-t">
          <Button 
            onClick={handleViewFullDetails}
            variant="outline" 
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            Tam Görünüm
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
