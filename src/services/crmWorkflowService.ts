
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { ProposalStatusShared } from "@/types/shared-types";
import { Opportunity, OpportunityStatus } from "@/types/crm";
import { mockCrmService } from "@/services/mockCrmService";

/**
 * Creates a follow-up task when a proposal status changes
 */
export const createProposalFollowUpTask = async (
  proposalId: string,
  status: ProposalStatusShared,
  customerId?: string,
  employeeId?: string
) => {
  try {
    // Get proposal details
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .single();

    if (proposalError) throw proposalError;

    // Define task details based on proposal status
    let taskTitle = "";
    let taskDescription = "";
    let dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2); // Default 2 days from now

    switch (status) {
      case "sent":
      case "gonderildi":
        taskTitle = "Teklif takibi yapın";
        taskDescription = `Teklif gönderildi, müşteri ile iletişime geçin - Teklif #${proposal.proposal_number}`;
        break;
      case "accepted":
        taskTitle = "Kabul edilen teklif işlemleri";
        taskDescription = `Müşteri teklifinizi kabul etti, sözleşme hazırlayın - Teklif #${proposal.proposal_number}`;
        break;
      default:
        // No task needed for other statuses
        return;
    }

    // Create a task
    await mockCrmService.createTask({
      title: taskTitle,
      description: taskDescription,
      status: "todo" as TaskStatus,
      priority: "medium" as TaskPriority,
      type: "follow_up" as TaskType,
      assignee_id: employeeId || null,
      due_date: dueDate.toISOString(),
      related_item_id: proposalId,
      related_item_title: `Teklif #${proposal.proposal_number}`
    });

    console.log(`Created follow-up task for proposal ${proposalId} with status ${status}`);
  } catch (error) {
    console.error("Error creating proposal follow-up task:", error);
    throw error;
  }
};

/**
 * Updates an opportunity when proposal status changes
 */
export const updateOpportunityOnProposalStatusChange = async (
  proposalId: string, 
  proposalStatus: ProposalStatusShared, 
  opportunityId: string
) => {
  try {
    // Map proposal status to opportunity status
    let opportunityStatus: OpportunityStatus;
    
    switch (proposalStatus) {
      case "sent":
      case "gonderildi":
        opportunityStatus = "proposal_sent";
        break;
      case "accepted":
        opportunityStatus = "accepted";
        break;
      case "rejected":
        opportunityStatus = "lost";
        break;
      default:
        opportunityStatus = "preparing_proposal";
    }
    
    // Update the opportunity status
    await mockCrmService.updateOpportunity(opportunityId, { 
      status: opportunityStatus 
    });
    
    console.log(`Updated opportunity ${opportunityId} status to ${opportunityStatus} based on proposal ${proposalId}`);
  } catch (error) {
    console.error("Error updating opportunity from proposal status:", error);
    throw error;
  }
};
