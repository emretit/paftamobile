
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
            title.ilike.%${filters.search}%,
            customer.name.ilike.%${filters.search}%
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
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Raw data from Supabase:", data);

      return (data || []).map(item => {
        let parsedItems = [];
        if (item.items) {
          try {
            parsedItems = typeof item.items === 'string' ? JSON.parse(item.items) : item.items;
          } catch (e) {
            console.error("Error parsing items:", e);
            parsedItems = [];
          }
        }

        // Handle status mapping to ensure TypeScript compliance
        let status: ProposalStatus = (item.status || 'new') as ProposalStatus;
        
        // Make sure the status is one of the allowed values
        const validStatuses: ProposalStatus[] = [
          'draft', 'new', 'review', 'sent', 'negotiation', 
          'accepted', 'rejected', 'expired', 'discovery_scheduled', 
          'meeting_completed', 'quote_in_progress', 'quote_sent', 
          'approved', 'converted_to_order'
        ];
        
        if (!validStatuses.includes(status)) {
          status = 'new'; // Default fallback
        }

        // Cast the employee data to the expected type
        const employee = item.employee ? {
          first_name: item.employee.first_name ?? "",
          last_name: item.employee.last_name ?? ""
        } : null;

        return {
          ...item,
          status,
          items: parsedItems,
          employee
        } as Proposal;
      });
    },
  });
};
