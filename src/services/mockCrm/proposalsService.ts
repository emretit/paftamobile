
import { supabase } from '@/integrations/supabase/client';
import { Proposal, ProposalItem } from '@/types/proposal';

// Type alias for JSON compatibility with Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export const mockCrmProposalsService = {
  getProposals: async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform proposals to ensure items are properly cast
      const proposals = data.map(proposal => ({
        ...proposal,
        items: Array.isArray(proposal.items) ? proposal.items as unknown as ProposalItem[] : []
      })) as unknown as Proposal[];
      
      return { data: proposals, error: null };
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return { data: [], error };
    }
  },

  getProposalById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Transform proposal to ensure items are properly cast
      const proposal = {
        ...data,
        items: Array.isArray(data.items) ? data.items as unknown as ProposalItem[] : []
      } as unknown as Proposal;
      
      return { data: proposal, error: null };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return { data: null, error };
    }
  }
};
