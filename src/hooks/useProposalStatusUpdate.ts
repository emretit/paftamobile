
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProposalStatus } from "@/types/crm";

export const useProposalStatusUpdate = (proposalId: string, opportunityId?: string) => {
  const queryClient = useQueryClient();

  const updateProposalStatus = useMutation({
    mutationFn: async (newStatus: ProposalStatus) => {
      const { error } = await supabase
        .from("proposals")
        .update({ status: newStatus })
        .eq("id", proposalId);

      if (error) throw error;

      // Since we don't have updateOpportunityOnProposalStatusChange yet, 
      // let's implement it inline for now
      if (opportunityId) {
        let opportunityStatus;
        
        switch (newStatus) {
          case "sent":
            opportunityStatus = "proposal_sent";
            break;
          case "accepted":
            opportunityStatus = "accepted";
            break;
          case "rejected":
            opportunityStatus = "lost";
            break;
        }
        
        if (opportunityStatus) {
          const { error: oppError } = await supabase
            .from("opportunities")
            .update({ status: opportunityStatus })
            .eq("id", opportunityId);
            
          if (oppError) {
            console.error("Error updating opportunity status:", oppError);
          }
        }
      }

      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success(`Teklif durumu güncellendi: ${newStatus}`);
    },
    onError: (error) => {
      toast.error("Teklif durumu güncellenirken bir hata oluştu");
      console.error("Error updating proposal status:", error);
    },
  });

  return updateProposalStatus;
};
