
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal } from "@/types/proposal";

interface ProposalFilters {
  search?: string;
  status?: string;
  employeeId?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

export const useProposals = (filters?: ProposalFilters) => {
  return useQuery({
    queryKey: ["proposals", filters],
    queryFn: async () => {
      let query = supabase.from("proposals").select(`
        *,
        customers(name, company),
        suppliers(name, company),
        employees(first_name, last_name)
      `);

      // Apply filters if provided
      if (filters) {
        // Search filter
        if (filters.search && filters.search.trim() !== "") {
          query = query.or(
            `proposal_number.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
          );
        }

        // Status filter
        if (filters.status) {
          query = query.eq("status", filters.status);
        }

        // Employee filter
        if (filters.employeeId) {
          query = query.eq("employee_id", filters.employeeId);
        }

        // Date range filter
        if (filters.dateRange?.from && filters.dateRange?.to) {
          query = query
            .gte("created_at", filters.dateRange.from.toISOString())
            .lte("created_at", filters.dateRange.to.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to include formatted names
      return (data as any[]).map((proposal) => {
        const employee = proposal.employees;
        return {
          ...proposal,
          employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'N/A',
          customer_name: proposal.customers?.name || proposal.suppliers?.name || 'N/A',
        };
      }) as Proposal[];
    },
  });
};
