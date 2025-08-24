
import { supabase } from '@/integrations/supabase/client';
import { Proposal, ProposalItem } from '@/types/proposal';

// Type alias for JSON compatibility with Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export const mockCrmProposalsService = {
  getProposals: async () => {
    try {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .order('created_at', { ascending: false });

      // Project scope filter (client-side addition besides RLS)
      const projectId = typeof window !== 'undefined'
        ? (localStorage.getItem('project_id') || localStorage.getItem('current_project_id') || '')
        : '';
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Use the proper data parser to handle JSON parsing for all proposals
      const { parseProposalData } = await import('../proposal/helpers/dataParser');
      const proposals = data.map(proposal => parseProposalData(proposal)).filter(Boolean) as Proposal[];
      
      return { data: proposals, error: null };
    } catch (error) {
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
      
      // Use the proper data parser to handle JSON parsing
      const { parseProposalData } = await import('../proposal/helpers/dataParser');
      const proposal = parseProposalData(data);
      
      return { data: proposal, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};
