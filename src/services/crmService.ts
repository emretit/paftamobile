import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Proposal, ProposalStatus, ProposalItem } from "@/types/proposal";
import { Opportunity, OpportunityStatus } from "@/types/crm";

// Function to generate a unique proposal number
const generateProposalNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6); // Get last 6 digits of timestamp
  const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Generate random 3-digit number
  return `TEKLIF-${timestamp}-${randomNumber}`;
};

export const createProposal = async (proposalData: Partial<Proposal>): Promise<Proposal> => {
  try {
    const proposalItems = proposalData.items || [];
    
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        id: uuidv4(),
        title: proposalData.title || "New Proposal",
        customer_id: proposalData.customer_id,
        opportunity_id: proposalData.opportunity_id,
        employee_id: proposalData.employee_id,
        status: "draft" as ProposalStatus,
        total_amount: proposalData.total_amount || 0,
        number: proposalData.number || generateProposalNumber(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: proposalItems as any,
        currency: proposalData.currency || "TRY",
        terms: proposalData.terms || "",
        notes: proposalData.notes || "",
        description: proposalData.description || "",
        valid_until: proposalData.valid_until
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform the response to match our Proposal type
    const result: Proposal = {
      id: data.id,
      title: data.title,
      number: data.number,
      customer_id: data.customer_id,
      opportunity_id: data.opportunity_id,
      employee_id: data.employee_id,
      status: data.status as ProposalStatus,
      total_amount: data.total_amount,
      created_at: data.created_at,
      updated_at: data.updated_at,
      valid_until: data.valid_until,
      items: Array.isArray(data.items) ? (data.items as any) as ProposalItem[] : [],
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      currency: data.currency || "TRY",
      terms: data.terms,
      notes: data.notes,
      description: data.description
    };
    
    return result;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

export const getProposalById = async (id: string): Promise<Proposal | null> => {
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
    
    // Transform the response to match our Proposal type
    const result: Proposal = {
      id: data.id,
      title: data.title,
      number: data.number,
      customer_id: data.customer_id,
      opportunity_id: data.opportunity_id,
      employee_id: data.employee_id,
      status: data.status as ProposalStatus,
      total_amount: data.total_amount,
      created_at: data.created_at,
      updated_at: data.updated_at,
      valid_until: data.valid_until,
      items: Array.isArray(data.items) ? (data.items as any) as ProposalItem[] : [],
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      currency: data.currency || "TRY",
      terms: data.terms,
      notes: data.notes,
      description: data.description,
      
      // Include the joined relations
      customer: data.customer,
      employee: data.employee,
      
      // Backward compatibility fields
      total_value: data.total_amount || 0,
      proposal_number: data.number,
      payment_terms: "",
      delivery_terms: "",
      internal_notes: "",
      discounts: 0,
      additional_charges: 0,
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return null;
  }
};

export const updateProposal = async (id: string, proposalData: Partial<Proposal>): Promise<Proposal> => {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .update({
        title: proposalData.title,
        customer_id: proposalData.customer_id,
        opportunity_id: proposalData.opportunity_id,
        employee_id: proposalData.employee_id,
        status: proposalData.status,
        total_amount: proposalData.total_amount,
        number: proposalData.number,
        updated_at: new Date().toISOString(),
        items: proposalData.items as any,
        currency: proposalData.currency,
        terms: proposalData.terms,
        notes: proposalData.notes,
        description: proposalData.description,
        valid_until: proposalData.valid_until,
        attachments: proposalData.attachments
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Proposal;
  } catch (error) {
    console.error('Error updating proposal:', error);
    throw error;
  }
};

export const deleteProposal = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting proposal:', error);
    throw error;
  }
};

export const addProposalComment = async (proposalId: string, comment: string): Promise<void> => {
  try {
    // Get the current proposal
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('notes')
      .eq('id', proposalId)
      .single();

    if (error) throw error;

    // Add the new comment to notes
    const newNotes = proposal.notes ? 
      `${proposal.notes}\n\n${new Date().toISOString()} - ${comment}` : 
      `${new Date().toISOString()} - ${comment}`;

    // Update the proposal
    await supabase
      .from('proposals')
      .update({ notes: newNotes })
      .eq('id', proposalId);
  } catch (error) {
    console.error('Error adding proposal comment:', error);
    throw error;
  }
};

export const updateProposalStatus = async (id: string, status: ProposalStatus): Promise<void> => {
  try {
    const { error } = await supabase
      .from('proposals')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    // For statuses that require notifications, we could add logic here
    if (status === "sent") {
      console.log("Proposal sent notification would be triggered here");
      // Notification logic would go here
    }
  } catch (error) {
    console.error('Error updating proposal status:', error);
    throw error;
  }
};

export const getProposalTotals = async (): Promise<{
  totalAmount: number;
  totalApproved: number;
  conversionRate: number;
}> => {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('*');

    if (error) throw error;

    let totalAmount = 0;
    let totalApproved = 0;
    let totalSent = 0;

    proposals.forEach((proposal) => {
      totalAmount += proposal.total_amount || 0;
      
      if (proposal.status === "approved") {
        totalApproved += proposal.total_amount || 0;
      }
      
      if (proposal.status === "sent") {
        totalSent += 1;
      }
    });

    const conversionRate = totalSent > 0 ? (proposals.filter(p => p.status === "approved").length / totalSent) * 100 : 0;

    return {
      totalAmount,
      totalApproved,
      conversionRate,
    };
  } catch (error) {
    console.error('Error getting proposal totals:', error);
    throw error;
  }
};

export const crmService = {
  createProposal,
  getProposalById,
  updateProposal,
  deleteProposal: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);
  
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw error;
    }
  },
  addProposalComment,
  updateProposalStatus,
  getProposalTotals,
  
  updateOpportunity: async (id: string, data: Partial<Opportunity>): Promise<{ data: Opportunity, error: any }> => {
    try {
      const { data: updatedData, error } = await supabase
        .from('opportunities')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .single();
        
      if (error) throw error;
      
      return { data: updatedData as Opportunity, error: null };
    } catch (error) {
      console.error('Error updating opportunity:', error);
      return { data: {} as Opportunity, error };
    }
  }
};
