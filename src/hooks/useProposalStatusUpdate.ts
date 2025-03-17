
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { updateOpportunityOnProposalStatusChange } from "@/services/crmWorkflowService";

export const useProposalStatusUpdate = () => {
  const queryClient = useQueryClient();

  const updateProposalStatus = useMutation({
    mutationFn: async ({ 
      proposalId, 
      status, 
      opportunityId 
    }: { 
      proposalId: string; 
      status: string;
      opportunityId?: string;
    }) => {
      const { error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', proposalId);

      if (error) throw error;
      
      return { proposalId, status, opportunityId };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      
      // If this proposal is linked to an opportunity, update it accordingly
      if (data.opportunityId) {
        await updateOpportunityOnProposalStatusChange(
          data.proposalId,
          data.opportunityId,
          data.status
        );
      }
      
      toast.success('Teklif durumu güncellendi');
    },
    onError: (error) => {
      toast.error('Teklif durumu güncellenirken bir hata oluştu');
      console.error('Error updating proposal status:', error);
    }
  });

  return {
    updateProposalStatus,
    isUpdating: updateProposalStatus.isPending
  };
};
