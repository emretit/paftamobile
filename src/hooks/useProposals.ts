
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { ProposalFilters } from "@/components/proposals/ProposalFilters";

export const useProposals = (filters?: ProposalFilters) => {
  return useQuery({
    queryKey: ["proposals", filters],
    queryFn: async (): Promise<Proposal[]> => {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          customer:customers(name),
          employee:employees(first_name, last_name)
        `);

      // Apply filters
      if (filters) {
        // Status filter
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        // Date range filter
        if (filters.dateRange.from) {
          query = query.gte('created_at', filters.dateRange.from.toISOString());
        }
        if (filters.dateRange.to) {
          query = query.lte('created_at', filters.dateRange.to.toISOString());
        }

        // Employee filter
        if (filters.employeeId) {
          query = query.eq('employee_id', filters.employeeId);
        }

        // Search filter
        if (filters.search) {
          query = query.or(`
            proposal_number.ilike.%${filters.search}%,
            customers.name.ilike.%${filters.search}%,
            employees.first_name.ilike.%${filters.search}%,
            employees.last_name.ilike.%${filters.search}%
          `);
        }
      }

      // Apply sorting
      if (filters?.sortBy) {
        query = query.order(filters.sortBy.field, { ascending: filters.sortBy.direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(item => ({
        ...item,
        status: item.status as ProposalStatus,
        items: item.items ? JSON.parse(item.items as string) : []
      }));
    },
  });
};
