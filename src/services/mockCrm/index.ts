
import { v4 as uuid } from 'uuid';
import { Proposal } from '@/types/proposal';
import { crmService } from '../crmService';

export const mockCrmService = {
  async getProposalById(id: string) {
    // Placeholder implementation
    // In real scenario, this would fetch from an API or database
    const dummyProposal: Proposal = {
      id,
      number: Math.floor(Math.random() * 10000).toString().padStart(5, '0'),
      title: "Sample Proposal",
      description: "This is a sample proposal for testing purposes",
      status: "draft",
      total_amount: 1500,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      payment_terms: "30 days",
      delivery_terms: "Within 14 days after payment",
      notes: "Sample notes",
      items: []
    };

    return { data: dummyProposal, error: null };
  },

  // For other operations, we'll use the real crmService
  ...crmService
};
