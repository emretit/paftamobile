
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task';
import { updateOpportunity } from '@/services/mockCrmService';
import { mockTasksAPI } from '@/services/mockCrmService';

// Helper function to format date as ISO string
const formatDateOffset = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

/**
 * Handle proposal status change workflow
 */
export const handleProposalStatusChange = async (
  proposalId: string,
  proposalTitle: string,
  opportunityId: string | null,
  newStatus: string,
  assigneeId?: string
) => {
  // Update linked opportunity status if available
  if (opportunityId && newStatus === 'sent') {
    await updateOpportunity(opportunityId, {
      status: 'proposal_sent'
    });
    
    // Create a follow-up task
    await createFollowUpTask({
      title: `Teklif Takibi: ${proposalTitle}`,
      related_item_id: proposalId,
      related_item_title: proposalTitle,
      related_item_type: 'proposal',
      assigned_to: assigneeId,
      due_date: formatDateOffset(3) // 3 days from now
    });
  }
};

/**
 * Create a follow-up task
 */
export const createFollowUpTask = async ({
  title,
  related_item_id,
  related_item_title,
  related_item_type,
  assigned_to,
  due_date
}: {
  title: string;
  related_item_id: string;
  related_item_title: string;
  related_item_type: string;
  assigned_to?: string;
  due_date?: string;
}) => {
  const task = {
    title,
    description: `${related_item_title} için takip.`,
    status: 'todo' as TaskStatus,
    priority: 'high' as TaskPriority,
    type: 'follow_up' as TaskType,
    assigned_to,
    due_date,
    related_item_id,
    related_item_title,
    related_item_type
  };
  
  return await mockTasksAPI.createTask(task);
};

/**
 * Create a reminder task for an opportunity
 */
export const createOpportunityReminderTask = async (
  opportunityId: string,
  opportunityTitle: string,
  employeeId?: string,
  daysOffset = 7
) => {
  const task = {
    title: `Hatırlatma: ${opportunityTitle}`,
    description: `${opportunityTitle} fırsatı için takip zamanı.`,
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    type: 'reminder' as TaskType,
    assigned_to: employeeId,
    due_date: formatDateOffset(daysOffset),
    related_item_id: opportunityId,
    related_item_title: opportunityTitle,
    related_item_type: 'opportunity'
  };
  
  return await mockTasksAPI.createTask(task);
};
