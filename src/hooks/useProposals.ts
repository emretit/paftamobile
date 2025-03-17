
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal } from "@/types/proposal";
import { ProposalFilters } from "@/components/proposals/types";

export const useProposals = (filters?: ProposalFilters) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .order('created_at', { ascending: false });
      
      // Apply status filter if specified
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      // Apply search filter if specified
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,proposal_number.ilike.%${filters.search}%`);
      }
      
      // Apply date range filter if specified
      if (filters?.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from);
      }
      
      if (filters?.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching proposals:", error);
        throw error;
      }
      
      return data as Proposal[];
    }
  });

  return { data, isLoading, error };
};
