
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProposalStatus } from "@/types/proposal";
import { toast } from "sonner";

interface StatusUpdateParams {
  proposalId: string;
  status: ProposalStatus;
}

export const useProposalStatusUpdate = () => {
  const queryClient = useQueryClient();
  
  const updateProposalStatus = useMutation({
    mutationFn: async ({ proposalId, status }: StatusUpdateParams) => {
      try {
        const { data, error } = await supabase
          .from('proposals')
          .update({ status })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success("Teklif durumu başarıyla güncellendi");
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
