
import { mockCrmOpportunitiesService } from './opportunitiesService';
import { mockCrmProposalsService } from './proposalsService';
import { mockCrmStatsService } from './statsService';
import { mockCrmTasksService, mockTasksAPI } from './tasksService';
import { crmService } from '@/services/crmService';

// Exporting as the original mockCrmService object
export const mockCrmService = {
  // Opportunities
  getOpportunities: mockCrmOpportunitiesService.getOpportunities,
  getOpportunityById: mockCrmOpportunitiesService.getOpportunityById,
  updateOpportunity: crmService.updateOpportunity.bind(crmService),
  
  // Proposals
  getProposals: mockCrmProposalsService.getProposals,
  getProposalById: mockCrmProposalsService.getProposalById,
  
  // Tasks
  getTasks: mockCrmTasksService.getTasks,
  getTaskById: mockCrmTasksService.getTaskById,
  
  // Stats
  getTaskStats: mockCrmStatsService.getTaskStats,
  getProposalStats: mockCrmStatsService.getProposalStats,
  getOpportunityStats: mockCrmStatsService.getOpportunityStats
};

// Also export individual services for more granular imports
export { mockTasksAPI };
