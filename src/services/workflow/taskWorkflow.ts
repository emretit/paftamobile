
import { formatDateOffset } from './utils';
import { mockCrmService, mockTasksAPI } from '@/services/mockCrm';

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
        related_item: {
          id: params.related_item_id,
          type: params.related_item_type,
          title: params.related_item_title
        }
      };
      
      // Create the task
      const { error } = await mockTasksAPI.createTask(task);
      
      if (error) {
        console.error("Error creating follow-up task:", error);
        return { success: false, error };
      }
      
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
        related_item: {
          id: opportunityId,
          type: 'opportunity',
          title: opportunityTitle
        }
      };
      
      const { error } = await mockTasksAPI.createTask(task);
      
      if (error) {
        console.error("Error creating opportunity task:", error);
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in assignOpportunityCreatedTask:", error);
      return { success: false, error };
    }
  }
};
