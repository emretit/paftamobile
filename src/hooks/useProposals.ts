
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal } from "@/types/proposal";
import { ProposalFilters } from "@/components/proposals/types";

export const useProposals = (filters?: ProposalFilters) => {
  return useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      try {
        // Start building the query
        let query = supabase
          .from("proposals")
          .select(`
            *,
            customer:customer_id(*),
            employee:employee_id(*)
          `);
        
        // Apply filters if provided
        if (filters) {
          if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
          }
          
          if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
          }
          
          if (filters.employeeId) {
            query = query.eq('employee_id', filters.employeeId);
          }
          
          if (filters.customerId) {
            query = query.eq('customer_id', filters.customerId);
          }
          
          if (filters.dateRange && filters.dateRange.from && filters.dateRange.to) {
            const fromDate = filters.dateRange.from.toISOString();
            const toDate = filters.dateRange.to.toISOString();
            query = query.gte('created_at', fromDate).lte('created_at', toDate);
          }
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data as Proposal[];
      } catch (error) {
        console.error("Error fetching proposals:", error);
        throw error;
      }
    }
  });
};
