
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Proposal, ProposalStatus } from "@/types/proposal";
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

      // Project scope: ensure only current project data is fetched (in addition to RLS)
      const projectId = typeof window !== 'undefined' 
        ? (localStorage.getItem('project_id') || localStorage.getItem('current_project_id') || '')
        : '';
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      // Apply status filter if specified
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      // Apply search filter if specified
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,number.ilike.%${filters.search}%`);
      }
      
      // Apply employee filter if specified
      if (filters?.employeeId && filters.employeeId !== 'all') {
        query = query.eq('employee_id', filters.employeeId);
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
      return data.map((item: any): Proposal => {
        return {
          id: item.id,
          number: item.number,
          title: item.title,
          description: item.description,
          customer_id: item.customer_id,
          opportunity_id: item.opportunity_id,
          employee_id: item.employee_id,
          status: item.status as ProposalStatus,
          total_amount: item.total_amount || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
          valid_until: item.valid_until,
          items: Array.isArray(item.items) ? item.items : [],
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
          currency: item.currency || "TRY",
          terms: item.terms,
          notes: item.notes,
          
          // Backward compatibility fields
          total_value: item.total_amount || 0,
          proposal_number: item.number,
          payment_terms: item.payment_terms || "",
          delivery_terms: item.delivery_terms || "",
          internal_notes: item.internal_notes || "",
          discounts: item.discounts || 0,
          additional_charges: item.additional_charges || 0,
          
          // Include relations
          customer: item.customer,
          employee: item.employee,
          customer_name: item.customer?.name,
          employee_name: item.employee ? `${item.employee.first_name} ${item.employee.last_name}` : undefined
        };
      });
    }
  });

  return { data, isLoading, error };
};
