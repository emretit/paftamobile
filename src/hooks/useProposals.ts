
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal, ProposalStatus } from "@/types/proposal";

export const useProposals = () => {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: async (): Promise<Proposal[]> => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          customer:customers(name),
          employee:employees(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Type cast the status to ensure it matches ProposalStatus type
      return data.map(item => ({
        ...item,
        status: item.status as ProposalStatus
      }));
    },
  });
};
