
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, ContactHistoryItem } from '@/types/crm';

// Type alias for JSON compatibility with Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export const mockCrmOpportunitiesService = {
  getOpportunities: async () => {
    try {
      // For now let's return mock data while we're fixing the build
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          title: 'New Software Implementation',
          description: 'ERP software implementation for ABC Company',
          status: 'new',
          priority: 'high',
          value: 50000,
          currency: 'TRY',
          customer_id: 'cust1',
          customer: {
            id: 'cust1',
            name: 'ABC Company',
            company: 'ABC Company'
          },
          assigned_to: 'emp1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          expected_close_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          contact_history: [],
          employee: {
            id: 'emp1',
            first_name: 'John',
            last_name: 'Doe',
            avatar_url: ''
          }
        },
        {
          id: '2',
          title: 'Network Upgrade Project',
          description: 'Complete network infrastructure upgrade',
          status: 'first_contact',
          priority: 'medium',
          value: 25000,
          currency: 'TRY',
          customer_id: 'cust2',
          customer: {
            id: 'cust2',
            name: 'XYZ Corporation',
            company: 'XYZ Corporation'
          },
          assigned_to: 'emp2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contact_history: [],
          employee: {
            id: 'emp2',
            first_name: 'Jane',
            last_name: 'Smith',
            avatar_url: ''
          }
        }
      ];
      
      return { data: mockOpportunities, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  getOpportunityById: async (id: string) => {
    try {
      // Mock implementation for a single opportunity
      const mockOpportunity: Opportunity = {
        id,
        title: 'Sample Opportunity',
        description: 'This is a sample opportunity for testing',
        status: 'new',
        priority: 'medium',
        value: 10000,
        currency: 'TRY',
        customer_id: 'cust1',
        customer: {
          id: 'cust1',
          name: 'ABC Company',
          company: 'ABC Company'
        },
        assigned_to: 'emp1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contact_history: [],
        employee: {
          id: 'emp1',
          first_name: 'John',
          last_name: 'Doe',
          avatar_url: ''
        }
      };
      
      return { data: mockOpportunity, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};
