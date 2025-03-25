
import { supabase } from "@/integrations/supabase/client";
import { Proposal } from "@/types/proposal";

export const crmService = {
  async createProposal(data: Partial<Proposal>) {
    try {
      const { data: result, error } = await supabase
        .from('proposals')
        .insert({
          title: data.title,
          description: data.description,
          valid_until: data.valid_until,
          payment_terms: data.payment_terms,
          delivery_terms: data.delivery_terms,
          notes: data.notes,
          status: data.status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Error creating proposal:', error);
      return { data: null, error };
    }
  },
  
  async getProposals() {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select()
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting proposals:', error);
      return { data: null, error };
    }
  },
};
