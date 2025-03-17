
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { crmWorkflowService } from "@/services/crmWorkflowService";
import { ProposalStatusShared } from "@/types/shared-types";

export const useProposalStatusUpdate = (proposalId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newStatus: ProposalStatusShared) => {
      try {
        // Update the proposal status
        const { error } = await supabase
          .from("proposals")
          .update({ status: newStatus })
          .eq("id", proposalId);
          
        if (error) throw error;
        
        // Get the opportunity_id if any
        const { data: proposal } = await supabase
          .from("proposals")
          .select("opportunity_id")
          .eq("id", proposalId)
          .single();
        
        // If proposal is linked to an opportunity, update opportunity status and create tasks
        if (proposal?.opportunity_id) {
          await crmWorkflowService.updateOpportunityOnProposalChange(
            proposalId,
            newStatus,
            proposal.opportunity_id
          );
        }
        
        return newStatus;
      } catch (error) {
        console.error("Error updating proposal status:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal", proposalId] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });
};
