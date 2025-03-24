import { supabase } from "@/integrations/supabase/client";
import { Proposal, ProposalStatus, ProposalAttachment } from "@/types/proposal";
import { Json } from "@/types/json";

export interface CrmServiceOptions {
  pageSize?: number;
  page?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

class CrmService {
  async getProposals(options: CrmServiceOptions = {}) {
    const {
      pageSize = 10,
      page = 1,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options;
    
    const startRow = (page - 1) * pageSize;
    const endRow = startRow + pageSize - 1;
    
    try {
      const { data, error, count } = await supabase
        .from('proposals')
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `, { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(startRow, endRow);
      
      if (error) throw error;
      
      return { data, count };
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return { data: [], count: 0 };
    }
  }
  
  async getProposalById(id: string) {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Convert the attachments from JSON to the correct type
      if (data && data.attachments) {
        data.attachments = data.attachments as unknown as ProposalAttachment[];
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return { data: null, error };
    }
  }
  
  async createProposal(proposal: Partial<Proposal>) {
    try {
      // Generate proposal number
      const proposalNumber = await this.generateProposalNumber();
      
      const { data, error } = await supabase
        .from('proposals')
        .insert({
          ...proposal,
          number: proposalNumber,
          status: proposal.status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert the attachments from JSON to the correct type
      if (data && data.attachments) {
        data.attachments = data.attachments as unknown as ProposalAttachment[];
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating proposal:', error);
      return { data: null, error };
    }
  }
  
  async updateProposal(id: string, proposal: Partial<Proposal>) {
    try {
      // Convert attachments to JSON type if needed
      let updateData = { ...proposal, updated_at: new Date().toISOString() };
      if (updateData.attachments) {
        updateData.attachments = updateData.attachments as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating proposal:', error);
      return { data: null, error };
    }
  }
  
  async deleteProposal(id: string) {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting proposal:', error);
      return { success: false, error };
    }
  }
  
  async updateProposalStatus(id: string, status: ProposalStatus) {
    return this.updateProposal(id, { status });
  }
  
  async addProposalAttachment(id: string, attachment: ProposalAttachment) {
    try {
      // First get the current proposal to get the existing attachments
      const { data: currentProposal } = await this.getProposalById(id);
      
      if (!currentProposal) {
        throw new Error('Proposal not found');
      }
      
      const currentAttachments = currentProposal.attachments || [];
      const updatedAttachments = [...currentAttachments, attachment];
      
      return this.updateProposal(id, { attachments: updatedAttachments });
    } catch (error) {
      console.error('Error adding proposal attachment:', error);
      return { data: null, error };
    }
  }
  
  private async generateProposalNumber(): Promise<string> {
    // Get the count of existing proposals
    const { count } = await supabase
      .from('proposals')
      .select('id', { count: 'exact' });
    
    // Generate a proposal number with date prefix and padded number
    const date = new Date();
    const year = date.getFullYear().toString().substring(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const nextNumber = (count || 0) + 1;
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    return `TEK-${year}${month}-${paddedNumber}`;
  }
}

export const crmService = new CrmService();

// Export the updateProposalStatus function separately for direct import
export const updateProposalStatus = (id: string, status: ProposalStatus) => {
  return crmService.updateProposalStatus(id, status);
};
