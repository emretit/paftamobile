
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Proposal } from "@/types/proposal";

export const useProposals = (filters?: {
  search?: string;
  status?: string;
  date?: string;
  employeeId?: string | null;
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
      
      if (filters?.employeeId && filters.employeeId !== "all") {
        query.eq("employee_id", filters.employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data for display
      const transformedData = data.map((proposal) => {
        // Handle potential null employee data safely
        let employeeName = '-';
        let employeeId = null;
        
        // Check if employee exists and is not null
        if (proposal.employee && typeof proposal.employee === 'object') {
          const employee = proposal.employee;
          // Use optional chaining and nullish coalescing to safely access properties
          const firstName = employee?.first_name ?? '';
          const lastName = employee?.last_name ?? '';
          employeeName = employee ? `${firstName} ${lastName}`.trim() || '-' : '-';
          employeeId = employee?.id ?? null;
        }
        
        return {
          ...proposal,
          customer_name: proposal.customer?.name || "-",
          employee_name: employeeName,
          employee_id: employeeId,
          // Remove the original employee object to avoid type issues
          employee: undefined
        };
      });

      // Use type assertion to make TypeScript happy
      return transformedData as unknown as Proposal[];
    },
  });

  return { data, isLoading, error };
};
