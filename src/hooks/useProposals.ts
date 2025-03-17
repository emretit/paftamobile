
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
        query = query.or(`title.ilike.%${filters.search}%,number.ilike.%${filters.search}%`);
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
      
      // Map the database fields to match our Proposal type
      return data.map((item) => {
        return {
          id: item.id,
          title: item.title,
          customer_id: item.customer_id,
          opportunity_id: item.opportunity_id,
          employee_id: item.employee_id,
          status: item.status,
          total_value: item.total_amount || 0,
          sent_date: item.sent_at,
          valid_until: item.valid_until,
          created_at: item.created_at,
          updated_at: item.updated_at,
          proposal_number: item.number,
          payment_terms: item.payment_terms,
          delivery_terms: item.delivery_terms,
          notes: item.notes,
          internal_notes: item.internal_notes,
          currency: item.currency,
          discounts: item.discounts,
          additional_charges: item.additional_charges,
          customer: item.customer,
          employee: item.employee,
          items: Array.isArray(item.items) ? item.items : [],
          attachments: Array.isArray(item.attachments) ? item.attachments : []
        } as Proposal;
      });
    }
  });

  return { data, isLoading, error };
};
