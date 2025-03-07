
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Proposal, ProposalStatus } from "@/types/proposal";

export function useProposalStatusUpdate() {
  const queryClient = useQueryClient();

  const updateProposalStatus = useMutation({
    mutationFn: async ({ 
      proposalId, 
      status 
    }: { 
      proposalId: string; 
      status: ProposalStatus 
    }) => {
      if (!proposalId) throw new Error('Proposal ID is required');

      const { data, error } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', proposalId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Teklif durumu başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error('Teklif durumu güncellenirken bir hata oluştu');
      console.error('Update error:', error);
    }
  });

  return {
    updateProposalStatus,
    isUpdating: updateProposalStatus.isPending
  };
}
