
import { handleProposalStatusChange } from './workflow/proposalWorkflow';
import { taskWorkflow } from './workflow/taskWorkflow';
import { createTaskForOpportunity } from './workflow/opportunityWorkflow';

export {
  handleProposalStatusChange,
  taskWorkflow,
  createTaskForOpportunity
};

// Re-export specific task workflow functions for backward compatibility
export const createFollowUpTask = taskWorkflow.createFollowUpTask;
export const createOpportunityReminderTask = taskWorkflow.createOpportunityReminderTask;
