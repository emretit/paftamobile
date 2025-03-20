import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Proposal, ProposalStatus } from "@/types/proposal";

// Function to generate a unique proposal number
const generateProposalNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6); // Get last 6 digits of timestamp
  const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Generate random 3-digit number
  return `TEKLIF-${timestamp}-${randomNumber}`;
};

export const createProposal = async (proposalData: Partial<Proposal>): Promise<Proposal> => {
  try {
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
        payment_terms: proposalData.payment_terms || "",
        delivery_terms: proposalData.delivery_terms || "",
        items: proposalData.items || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data as Proposal;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
};

export const getProposalById = async (id: string): Promise<Proposal | null> => {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Proposal;
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
      .select('comments')
      .eq('id', proposalId)
      .single();

    if (error) throw error;

    // Add the new comment
    const comments = proposal.comments || [];
    comments.push({
      id: uuidv4(),
      content: comment,
      created_at: new Date().toISOString(),
      user_id: 'system', // Replace with actual user ID when auth is implemented
    });

    // Update the proposal
    await supabase
      .from('proposals')
      .update({ comments })
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
    if (status === "quote_sent") {
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
      
      if (proposal.status === "quote_sent") {
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
