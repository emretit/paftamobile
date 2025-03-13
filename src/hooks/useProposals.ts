
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Proposal } from "@/types/proposal";

export const useProposals = (filters?: any) => {
  const { data: proposals = [], isLoading, error } = useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select(`
          *,
          customer:customer_id (
            id,
            name
          ),
          employee:employee_id (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(proposal => ({
        ...proposal,
        customer_name: proposal.customer?.name || '-',
        created_by_name: proposal.employee ? 
          `${proposal.employee.first_name || ''} ${proposal.employee.last_name || ''}` : '-',
        created_by: {
          id: proposal.employee?.id || '',
          name: proposal.employee ? 
            `${proposal.employee.first_name || ''} ${proposal.employee.last_name || ''}` : '-'
        }
      })) as Proposal[];
    }
  });

  return {
    proposals,
    isLoading,
    error
  };
};
