
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Proposal } from "@/types/proposal";

export const useProposals = (filters?: any) => {
  const { data, isLoading, error } = useQuery({
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
      
      // Transform the data to match Proposal type
      const formattedData = (data || []).map(proposal => {
        // Handle the case where employee might be null or an error object
        const employeeData = proposal.employee && 
          typeof proposal.employee === 'object' && 
          !('error' in proposal.employee) ? 
          proposal.employee : 
          { id: '', first_name: '', last_name: '' };
        
        return {
          ...proposal,
          customer_name: proposal.customer?.name || '-',
          created_by_name: employeeData ? 
            `${employeeData.first_name || ''} ${employeeData.last_name || ''}` : '-',
          created_by: {
            id: employeeData?.id || '',
            name: employeeData ? 
              `${employeeData.first_name || ''} ${employeeData.last_name || ''}` : '-'
          }
        };
      });

      return formattedData as unknown as Proposal[];
    }
  });

  return {
    proposals: data || [],
    isLoading,
    error
  };
};
