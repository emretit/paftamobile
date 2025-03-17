
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProposalStatus } from "@/types/crm";
import { updateOpportunityOnProposalStatusChange } from "@/services/crmWorkflowService";

export const useProposalStatusUpdate = (proposalId: string, opportunityId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newStatus: ProposalStatus) => {
      const { error } = await supabase
        .from("proposals")
        .update({ status: newStatus })
        .eq("id", proposalId);

      if (error) throw error;

      // Update the related opportunity if it exists
      if (opportunityId) {
        try {
          await updateOpportunityOnProposalStatusChange(proposalId, newStatus, opportunityId);
        } catch (err) {
          console.error("Error updating opportunity:", err);
          // Don't fail the whole operation if this part fails
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
};
