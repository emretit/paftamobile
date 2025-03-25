
import { supabase } from "@/integrations/supabase/client";
import { Proposal } from "@/types/proposal";
import { Opportunity } from "@/types/crm";

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

  async updateProposal(id: string, data: Partial<Proposal>) {
    try {
      const { data: result, error } = await supabase
        .from('proposals')
        .update({
          title: data.title,
          description: data.description,
          valid_until: data.valid_until,
          payment_terms: data.payment_terms,
          delivery_terms: data.delivery_terms,
          notes: data.notes,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Error updating proposal:', error);
      return { data: null, error };
    }
  },

  async changeProposalStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error changing proposal status:', error);
      return { data: null, error };
    }
  },

  async updateOpportunity(id: string, data: Partial<Opportunity>) {
    try {
      const { data: result, error } = await supabase
        .from('opportunities')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Error updating opportunity:', error);
      return { data: null, error };
    }
  },

  async getOpportunities() {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          customer:customer_id (*),
          employee:assigned_to (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error getting opportunities:', error);
      return { data: [], error };
    }
  }
};
