
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
      
      // Transform proposal to ensure items are properly cast and have all required fields
      const proposal = {
        ...data,
        items: Array.isArray(data.items) ? (data.items as any[]).map(item => ({
          id: item.id || crypto.randomUUID(),
          name: item.name || "",
          description: item.description || item.name || "",
          quantity: item.quantity || 1,
          unit: item.unit || "adet",
          unit_price: item.unit_price || 0,
          total_price: item.total_price || (item.quantity || 1) * (item.unit_price || 0),
          currency: item.currency || data.currency || "TRY",
          tax_rate: item.tax_rate || 18,
          discount_rate: item.discount_rate || 0,
          product_id: item.product_id,
          original_currency: item.original_currency,
          original_price: item.original_price,
          stock_status: item.stock_status
        })) : []
      } as unknown as Proposal;
      
      console.log("🔍 Fetched proposal with items:", proposal);
      
      return { data: proposal, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};
