
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Proposal } from "@/types/proposal";

export const useProposals = (filters?: {
  search?: string;
  status?: string;
  date?: string;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      const query = supabase
        .from("proposals")
        .select(`
          *,
          customer:customer_id(id, name),
          employee:employee_id(*)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query.eq("status", filters.status);
      }

      if (filters?.search) {
        query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data for display
      const transformedData = data.map((proposal) => {
        // Handle potential null employee data safely
        const employeeName = proposal.employee 
          ? `${proposal.employee.first_name || ''} ${proposal.employee.last_name || ''}`.trim()
          : '-';
        
        const employeeId = proposal.employee?.id || null;
        
        return {
          ...proposal,
          customer_name: proposal.customer?.name || "-",
          employee_name: employeeName,
          employee_id: employeeId,
        };
      });

      return transformedData as Proposal[];
    },
  });

  return { data, isLoading, error };
};
