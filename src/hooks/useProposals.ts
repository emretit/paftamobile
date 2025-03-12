
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Proposal } from "@/types/proposal";

export const useProposals = () => {
  const { data, isLoading, error } = useQuery<Proposal[]>({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          customer:customer_id (
            company_name,
            first_name,
            last_name
          ),
          employee:created_by (
            id,
            first_name,
            last_name
          )
        `)
        .eq("item_type", "proposal")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
  });

  // Format proposal data
  const formatProposalData = (proposals: Proposal[]) => {
    return proposals.map(item => ({
      ...item,
      customer_name: item.customer ? `${item.customer.company_name || item.customer.first_name + ' ' + item.customer.last_name}` : '-',
      created_by_name: item.employee && item.employee.first_name ? `${item.employee.first_name} ${item.employee.last_name}` : '-',
      created_by: {
        id: item.employee?.id || '',
        name: item.employee ? `${item.employee.first_name || ''} ${item.employee.last_name || ''}` : '-',
      },
    }));
  };

  const proposals = data ? formatProposalData(data) : [];

  return {
    proposals,
    isLoading,
    error,
  };
};
