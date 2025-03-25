
import { formatDateOffset } from './utils';
import { mockTasksAPI } from '@/services/mockCrm';
import { Opportunity } from '@/types/crm';

export const opportunityWorkflow = {
  /**
   * Handle new opportunity creation
   */
  handleNewOpportunity: async (opportunity: Opportunity) => {
    try {
      // Create a task for the assigned employee to follow up
      await createFollowUpTask(opportunity);
      
      return { success: true };
    } catch (error) {
      console.error("Error in handleNewOpportunity:", error);
      return { success: false, error };
    }
  },
  
  /**
   * Handle opportunity status change
   */
  handleStatusChange: async (opportunity: Opportunity, previousStatus: string) => {
    try {
      // If moved to "proposal_sent", create a task to follow up in 3 days
      if (opportunity.status === 'proposal_sent' && previousStatus !== 'proposal_sent') {
        await createProposalFollowUpTask(opportunity);
      }
      
      // If moved to "site_visit", create a task to prepare for the visit
      if (opportunity.status === 'site_visit' && previousStatus !== 'site_visit') {
        await createSiteVisitTask(opportunity);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      return { success: false, error };
    }
  }
};

// Helper functions
async function createFollowUpTask(opportunity: Opportunity) {
  return mockTasksAPI.createTask({
    title: `İlk görüşme: ${opportunity.title}`,
    description: 'Müşteriyle ilk görüşmeyi planla',
    status: 'todo',
    priority: 'high',
    assigned_to: opportunity.assigned_to,
    due_date: formatDateOffset(1),
    related_item_id: opportunity.id,
    related_item_type: 'opportunity',
    related_item_title: opportunity.title
  });
}

async function createProposalFollowUpTask(opportunity: Opportunity) {
  return mockTasksAPI.createTask({
    title: `Takip: ${opportunity.title} teklifi`,
    description: 'Gönderilen teklif hakkında müşteriyle iletişime geç',
    status: 'todo',
    priority: 'high',
    assigned_to: opportunity.assigned_to,
    due_date: formatDateOffset(3),
    related_item_id: opportunity.id,
    related_item_type: 'opportunity',
    related_item_title: opportunity.title
  });
}

async function createSiteVisitTask(opportunity: Opportunity) {
  return mockTasksAPI.createTask({
    title: `Ziyaret hazırlığı: ${opportunity.title}`,
    description: 'Saha ziyareti öncesi gerekli hazırlıkları tamamla',
    status: 'todo',
    priority: 'high',
    assigned_to: opportunity.assigned_to,
    due_date: formatDateOffset(1),
    related_item_id: opportunity.id,
    related_item_type: 'opportunity',
    related_item_title: opportunity.title
  });
}
