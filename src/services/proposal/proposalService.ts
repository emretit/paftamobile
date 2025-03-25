
import { supabase } from "@/integrations/supabase/client";
import { Proposal, ProposalStatus, ProposalAttachment, ProposalItem } from "@/types/proposal";
import { Json } from "@/types/json";
import { BaseService, ServiceOptions } from "../base/BaseService";

export class ProposalService extends BaseService {
  async getProposals(options: ServiceOptions = {}) {
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
      
      // Convert the attachments from JSON to the correct Type
      if (data && data.attachments) {
        data.attachments = data.attachments as unknown as ProposalAttachment[];
      }
      
      // Convert items from JSON to the correct Type
      if (data && data.items) {
        data.items = data.items as unknown as ProposalItem[];
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
      
      // Create a clean insert data object
      const insertData: any = {
        title: proposal.title,
        description: proposal.description,
        customer_id: proposal.customer_id,
        employee_id: proposal.employee_id,
        opportunity_id: proposal.opportunity_id,
        number: proposalNumber,
        status: proposal.status || 'draft',
        valid_until: proposal.valid_until,
        payment_terms: proposal.payment_terms,
        delivery_terms: proposal.delivery_terms,
        notes: proposal.notes,
        terms: proposal.terms,
        currency: proposal.currency || 'TRY',
        total_amount: proposal.total_amount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add attachments and items if they exist
      if (proposal.attachments && proposal.attachments.length > 0) {
        // Use a safe type conversion to match the expected Json type
        insertData.attachments = proposal.attachments as unknown as Json;
      }
      
      if (proposal.items && proposal.items.length > 0) {
        // Use a safe type conversion to match the expected Json type
        insertData.items = proposal.items as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('proposals')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert the attachments from JSON to the correct Type for the response
      if (data.attachments) {
        data.attachments = data.attachments as unknown as ProposalAttachment[];
      }
      
      // Convert items from JSON to the correct Type for the response
      if (data.items) {
        data.items = data.items as unknown as ProposalItem[];
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating proposal:', error);
      return { data: null, error };
    }
  }
  
  async updateProposal(id: string, proposal: Partial<Proposal>) {
    try {
      // Create a clean update data object
      const updateData: Record<string, any> = { 
        updated_at: new Date().toISOString() 
      };
      
      // Copy simple properties
      if (proposal.title !== undefined) updateData.title = proposal.title;
      if (proposal.description !== undefined) updateData.description = proposal.description;
      if (proposal.customer_id !== undefined) updateData.customer_id = proposal.customer_id;
      if (proposal.employee_id !== undefined) updateData.employee_id = proposal.employee_id;
      if (proposal.opportunity_id !== undefined) updateData.opportunity_id = proposal.opportunity_id;
      if (proposal.status !== undefined) updateData.status = proposal.status;
      if (proposal.valid_until !== undefined) updateData.valid_until = proposal.valid_until;
      if (proposal.payment_terms !== undefined) updateData.payment_terms = proposal.payment_terms;
      if (proposal.delivery_terms !== undefined) updateData.delivery_terms = proposal.delivery_terms;
      if (proposal.notes !== undefined) updateData.notes = proposal.notes;
      if (proposal.terms !== undefined) updateData.terms = proposal.terms;
      if (proposal.currency !== undefined) updateData.currency = proposal.currency;
      if (proposal.total_amount !== undefined) updateData.total_amount = proposal.total_amount;
      
      // Handle complex types that need conversion
      if (proposal.attachments !== undefined) {
        // Use a safe type conversion to match the expected Json type
        updateData.attachments = proposal.attachments as unknown as Json;
      }
      
      if (proposal.items !== undefined) {
        // Use a safe type conversion to match the expected Json type
        updateData.items = proposal.items as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('proposals')
        .update(updateData as any)
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

export const proposalService = new ProposalService();

// Export the updateProposalStatus function separately for direct import
export const updateProposalStatus = (id: string, status: ProposalStatus) => {
  return proposalService.updateProposalStatus(id, status);
};
