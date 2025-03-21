
// This file acts as the entry point for the mock CRM service
// Re-exporting all services for backward compatibility

import { mockTasksAPI } from './tasksService';
import { mockCrmTasksService } from './tasksService';
import { mockCrmProposalsService } from './proposalsService';
import { mockCrmOpportunitiesService } from './opportunitiesService';
import { mockCrmStatsService } from './statsService';
import { mockCrmOpportunityService } from './opportunityService';

// Create a combined service for backward compatibility
export const mockCrmService = {
  // Tasks
  getTasks: mockCrmTasksService.getTasks,
  getTaskById: mockCrmTasksService.getTaskById,
  
  // Proposals
  getProposals: mockCrmProposalsService.getProposals,
  getProposalById: mockCrmProposalsService.getProposalById,
  
  // Opportunities
  getOpportunities: mockCrmOpportunitiesService.getOpportunities,
  getOpportunityById: mockCrmOpportunitiesService.getOpportunityById,
  
  // Stats
  getTaskStats: mockCrmStatsService.getTaskStats,
  getProposalStats: mockCrmStatsService.getProposalStats,
  getOpportunityStats: mockCrmStatsService.getOpportunityStats,
  
  // Update operations
  updateOpportunity: mockCrmOpportunityService.updateOpportunity
};

// Export the task API directly for services that use it
export { mockTasksAPI };
