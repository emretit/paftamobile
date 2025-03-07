
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalBasicInfo } from "./detail/ProposalBasicInfo";
import { ProposalDetailsTab } from "./detail/ProposalDetailsTab";
import { ProposalItemsTab } from "./detail/ProposalItemsTab";
import { ProposalNotesTab } from "./detail/ProposalNotesTab";
import { StatusBadge } from "./detail/StatusBadge";

interface ProposalDetailSheetProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProposalDetailSheet = ({ proposal, isOpen, onClose }: ProposalDetailSheetProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Proposal | null>(null);

  useEffect(() => {
    if (proposal) {
      setFormData(proposal);
    }
  }, [proposal]);

  const updateProposalMutation = useMutation({
    mutationFn: async (updatedProposal: Partial<Proposal>) => {
      if (!proposal?.id) throw new Error('Proposal ID is required');

      const { data, error } = await supabase
        .from('proposals')
        .update(updatedProposal as any)
        .eq('id', proposal.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Teklif başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error('Teklif güncellenirken bir hata oluştu');
      console.error('Update error:', error);
    }
  });

  const handleStatusChange = (status: ProposalStatus) => {
    if (!formData) return;
    const updatedData = { ...formData, status };
    setFormData(updatedData);
    updateProposalMutation.mutate({ status });
  };

  if (!formData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Teklif #{formData.proposal_number}
            </h2>
            <StatusBadge status={formData.status} />
          </div>
        </SheetHeader>
        
        <div className="py-4">
          <h3 className="text-xl font-semibold mb-2">{formData.title}</h3>
          
          <ProposalBasicInfo proposal={formData} />

          <Tabs defaultValue="details">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="details" className="flex-1">Teklif Detayları</TabsTrigger>
              <TabsTrigger value="items" className="flex-1">Kalemler</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">Notlar</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <ProposalDetailsTab 
                proposal={formData} 
                onStatusChange={handleStatusChange} 
              />
            </TabsContent>

            <TabsContent value="items">
              <ProposalItemsTab proposal={formData} />
            </TabsContent>

            <TabsContent value="notes">
              <ProposalNotesTab proposal={formData} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>Kapat</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
