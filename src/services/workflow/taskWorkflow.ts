
import { formatDateOffset } from './utils';
import { mockCrmService } from '@/services/mockCrm';

interface AssignTaskParams {
  title: string;
  description?: string;
  assigned_to?: string;
  due_date?: string;
  priority?: string;
  related_item_id?: string;
  related_item_type?: string;
  related_item_title?: string;
}

export const taskWorkflow = {
  /**
   * Create a new follow-up task
   */
  createFollowUpTask: async (params: AssignTaskParams) => {
    try {
      const task = {
        title: params.title,
        description: params.description || 'Takip gerekli',
        status: 'todo',
        priority: params.priority || 'medium',
        assigned_to: params.assigned_to,
        due_date: params.due_date || formatDateOffset(3),
        related_item_id: params.related_item_id,
        related_item_type: params.related_item_type,
        related_item_title: params.related_item_title
      };
      
      // Here we would create the task, but we're using a mock for now
      console.log("Creating follow-up task:", task);
      
      return { success: true };
    } catch (error) {
      console.error("Error in createFollowUpTask:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Assign a task to a user when a new opportunity is created
   */
  assignOpportunityCreatedTask: async (opportunityId: string, opportunityTitle: string, assigneeId?: string) => {
    try {
      const task = {
        title: `İnceleme: ${opportunityTitle}`,
        description: 'Yeni oluşturulan fırsatı inceleyiniz.',
        status: 'todo',
        priority: 'high',
        assigned_to: assigneeId,
        due_date: formatDateOffset(1),
        related_item_id: opportunityId,
        related_item_type: 'opportunity',
        related_item_title: opportunityTitle
      };
      
      // Here we would create the task, but we're using a mock for now
      console.log("Creating opportunity task:", task);
      
      return { success: true };
    } catch (error) {
      console.error("Error in assignOpportunityCreatedTask:", error);
      return { success: false, error };
    }
  }
};
