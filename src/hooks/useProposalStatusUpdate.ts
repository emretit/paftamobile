
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProposalStatus } from "@/types/proposal";
import { toast } from "sonner";
import { statusLabels } from "@/components/proposals/constants";

interface StatusUpdateParams {
  proposalId: string;
  status: ProposalStatus;
  opportunityId?: string | null;
}

export const useProposalStatusUpdate = () => {
  const queryClient = useQueryClient();
  
  const updateProposalStatus = useMutation({
    mutationFn: async ({ proposalId, status, opportunityId }: StatusUpdateParams) => {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .update({ 
            status,
            ...(status === 'gonderildi' ? { sent_date: new Date().toISOString() } : {})
          })
          .eq('id', proposalId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating proposal status:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      
      // If the status is 'gonderildi', also invalidate tasks and opportunities
      if (variables.status === 'gonderildi') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      }
      
      const statusLabel = statusLabels[variables.status] || variables.status;
      
      toast.success(`Teklif durumu başarıyla "${statusLabel}" olarak güncellendi`);
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error("Teklif durumu güncellenirken bir hata oluştu");
    }
  });

  return {
    updateProposalStatus,
    isUpdating: updateProposalStatus.isPending
  };
};
