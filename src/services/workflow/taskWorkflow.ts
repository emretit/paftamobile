
import { formatDateOffset } from './utils';
import { TaskStatus, TaskPriority, TaskType } from '@/types/task';
import { mockTasksAPI } from '@/services/mockCrm';

/**
 * Task workflow service functions
 */
export const taskWorkflow = {
  /**
   * Create a follow-up task
   */
  createFollowUpTask: async ({
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
    try {
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
        related_item_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return await mockTasksAPI.createTask(task);
    } catch (error) {
      // Return a default error response
      return { data: null, error };
    }
  },

  /**
   * Create a reminder task for an opportunity
   */
  createOpportunityReminderTask: async (
    opportunityId: string,
    opportunityTitle: string,
    employeeId?: string,
    daysOffset = 7
  ) => {
    try {
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
        related_item_type: 'opportunity',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return await mockTasksAPI.createTask(task);
    } catch (error) {
      // Return a default error response
      return { data: null, error };
    }
  }
};
