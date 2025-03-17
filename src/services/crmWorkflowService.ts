
import { supabase } from "@/integrations/supabase/client";
import { OpportunityStatus, OpportunityExtended } from "@/types/crm";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { mockOpportunitiesAPI, crmSupabase } from "./mockCrmService";

// This function creates relevant tasks based on opportunity status changes
export const createTaskForOpportunity = async (
  opportunityId: string,
  opportunityTitle: string,
  status: OpportunityStatus,
  assigneeId?: string
): Promise<void> => {
  let taskTitle = "";
  let taskDescription = `Related to: ${opportunityTitle}`;
  
  // Define task title based on the new status
  switch (status) {
    case "new":
      taskTitle = "İlk görüşmeyi yap ve ziyaret planla";
      break;
    case "first_contact":
      taskTitle = "Ziyaret Yap ve raporla";
      break;
    case "site_visit":
      taskTitle = "Teklif Hazırla";
      break;
    case "preparing_proposal":
      taskTitle = "Teklifi tamamla ve gönder";
      break;
    case "proposal_sent":
      taskTitle = "Teklif Takibini Yap";
      break;
    case "accepted":
      taskTitle = "Satış Sözleşmesi Hazırla";
      break;
    case "lost":
      taskTitle = "Fırsatı Kapat ve Kaybetme Nedeni Raporla";
      break;
    default:
      taskTitle = `Fırsat takibi: ${opportunityTitle}`;
  }
  
  // Create task in database
  try {
    const taskData = {
      title: taskTitle,
      description: taskDescription,
      status: "todo" as TaskStatus,
      priority: "medium" as TaskPriority,
      type: "opportunity",
      assignee_id: assigneeId,
      due_date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), // Due in 2 days
      related_item_id: opportunityId,
      related_item_title: opportunityTitle
    };
    
    await mockOpportunitiesAPI.createTask?.(taskData);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Function to update related tasks when an opportunity's status changes
export const updateRelatedTasks = async (
  opportunityId: string,
  status: OpportunityStatus
): Promise<void> => {
  try {
    const { data: opportunity } = await mockOpportunitiesAPI.getOpportunity(opportunityId);
    
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }
    
    // Mark existing tasks as completed if they're not already
    try {
      const { data: tasks } = await crmSupabase.from('tasks')
        .select('*')
        .eq('related_item_id', opportunityId)
        .eq('status', 'todo');
        
      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          await crmSupabase.from('tasks')
            .update({ status: 'completed' })
            .eq('id', task.id);
        }
      }
    } catch (err) {
      console.error('Error updating existing tasks:', err);
    }
    
    // Create new task for the new status
    await createTaskForOpportunity(
      opportunity.id,
      opportunity.title,
      status,
      opportunity.employee_id
    );
  } catch (error) {
    console.error('Error updating related tasks:', error);
    throw error;
  }
};

// Export function to update opportunity on proposal status change
export const updateOpportunityOnProposalStatusChange = async (
  proposalId: string,
  status: string,
  opportunityId?: string
): Promise<void> => {
  if (!opportunityId) return;
  
  try {
    let opportunityStatus: OpportunityStatus | undefined;
    
    // Map proposal status to corresponding opportunity status
    switch (status) {
      case "sent":
        opportunityStatus = "proposal_sent";
        break;
      case "accepted":
        opportunityStatus = "accepted";
        break;
      case "rejected":
        opportunityStatus = "lost";
        break;
      default:
        // No need to update for other statuses
        return;
    }
    
    if (opportunityStatus) {
      await mockOpportunitiesAPI.updateOpportunity(opportunityId, { status: opportunityStatus });
      await updateRelatedTasks(opportunityId, opportunityStatus);
    }
  } catch (error) {
    console.error('Error updating opportunity on proposal status change:', error);
  }
};
