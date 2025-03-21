
import { mockCrmOpportunityService } from './opportunityService';
import { mockCrmOpportunitiesService } from './opportunitiesService';
import { mockCrmProposalsService } from './proposalsService';
import { mockCrmStatsService } from './statsService';
import { mockCrmTasksService } from './tasksService';

// Exporting as the original mockCrmService object
export const mockCrmService = {
  // Opportunities
  getOpportunities: mockCrmOpportunitiesService.getOpportunities,
  getOpportunityById: mockCrmOpportunitiesService.getOpportunityById,
  updateOpportunity: mockCrmOpportunityService.updateOpportunity,
  
  // Proposals
  getProposals: mockCrmProposalsService.getProposals,
  getProposalById: mockCrmProposalsService.getProposalById,
  
  // Tasks
  getTasks: mockCrmTasksService.getTasks,
  getTaskById: mockCrmTasksService.getTaskById,
  getSubtasks: mockCrmTasksService.getSubtasks,
  
  // Stats
  getStats: mockCrmStatsService.getStats,
  getOpportunityCountByStatus: mockCrmStatsService.getOpportunityCountByStatus,
  getProposalCountByStatus: mockCrmStatsService.getProposalCountByStatus,
  getRecentActivity: mockCrmStatsService.getRecentActivity
};

// Also export individual services for more granular imports
export const mockTasksAPI = mockCrmTasksService;
