
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
        // Handle null employee more safely with optional chaining and nullish coalescing
        const employeeFirstName = proposal.employee?.first_name ?? '';
        const employeeLastName = proposal.employee?.last_name ?? '';
        const employeeId = proposal.employee?.id ?? '';
        
        return {
          ...proposal,
          customer_name: proposal.customer?.name || '-',
          created_by_name: employeeFirstName || employeeLastName ? 
            `${employeeFirstName} ${employeeLastName}`.trim() : '-',
          created_by: {
            id: employeeId,
            name: employeeFirstName || employeeLastName ? 
              `${employeeFirstName} ${employeeLastName}`.trim() : '-'
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
