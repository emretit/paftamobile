
import { formatDateOffset } from './utils';
import { mockCrmService, mockTasksAPI } from '@/services/mockCrm';
import { taskWorkflow } from './taskWorkflow';

/**
 * Handle proposal status change workflow
 * Creates appropriate tasks and updates related opportunities
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
    await mockCrmService.updateOpportunity(opportunityId, {
      status: 'proposal_sent' as any
    });
    
    // Create a follow-up task
    await taskWorkflow.createFollowUpTask({
      title: `Teklif Takibi: ${proposalTitle}`,
      related_item_id: proposalId,
      related_item_title: proposalTitle,
      related_item_type: 'proposal',
      assigned_to: assigneeId,
      due_date: formatDateOffset(3) // 3 days from now
    });
  }
};
