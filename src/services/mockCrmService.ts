
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, OpportunityStatus } from '@/types/crm';
import { Proposal, ProposalStatus } from '@/types/proposal';
import { Task, TaskStatus } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

export const mockCrmService = {
  // Task related methods
  getTasks: async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id (id, first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Task[], error: null };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: [], error };
    }
  },

  getTaskById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id (id, first_name, last_name, avatar_url),
          subtasks (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Task, error: null };
    } catch (error) {
      console.error('Error fetching task:', error);
      return { data: null, error };
    }
  },

  // Proposal related methods
  getProposals: async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Proposal[], error: null };
    } catch (error) {
      console.error('Error fetching proposals:', error);
      return { data: [], error };
    }
  },

  getProposalById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Proposal, error: null };
    } catch (error) {
      console.error('Error fetching proposal:', error);
      return { data: null, error };
    }
  },

  // Opportunity related methods
  getOpportunities: async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Opportunity[], error: null };
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return { data: [], error };
    }
  },

  getOpportunityById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Opportunity, error: null };
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      return { data: null, error };
    }
  },

  // Task statistics 
  getTaskStats: async () => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status');

    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: overdueTasks, error: overdueError } = await supabase
      .from('tasks')
      .select('id')
      .lt('due_date', today.toISOString())
      .neq('status', 'completed');

    if (overdueError) throw overdueError;

    return {
      total: tasks?.length || 0,
      overdue: overdueTasks?.length || 0,
      completed: tasks?.filter(t => t.status === 'completed')?.length || 0,
      inProgress: tasks?.filter(t => t.status === 'in_progress')?.length || 0,
      todo: tasks?.filter(t => t.status === 'todo')?.length || 0,
    };
  },

  // Proposal statistics
  getProposalStats: async () => {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('status, total_amount');

    if (error) throw error;

    const statusCounts: Record<string, number> = {};
    let totalAmount = 0;
    let acceptedAmount = 0;

    proposals?.forEach(proposal => {
      statusCounts[proposal.status] = (statusCounts[proposal.status] || 0) + 1;
      totalAmount += proposal.total_amount || 0;
      if (proposal.status === 'accepted') {
        acceptedAmount += proposal.total_amount || 0;
      }
    });

    return {
      totalCount: proposals?.length || 0,
      statusCounts,
      totalAmount,
      acceptedAmount,
      conversionRate: proposals?.length > 0 ? (statusCounts['accepted'] || 0) / proposals.length * 100 : 0
    };
  },

  // Opportunity statistics
  getOpportunityStats: async () => {
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('status, value');

    if (error) throw error;

    const statusCounts: Record<string, number> = {};
    let totalValue = 0;
    let wonValue = 0;

    opportunities?.forEach(opportunity => {
      statusCounts[opportunity.status] = (statusCounts[opportunity.status] || 0) + 1;
      totalValue += opportunity.value || 0;
      if (opportunity.status === 'accepted') {
        wonValue += opportunity.value || 0;
      }
    });

    return {
      totalCount: opportunities?.length || 0,
      statusCounts,
      totalValue,
      wonValue,
      winRate: opportunities?.length > 0 ? (statusCounts['accepted'] || 0) / opportunities.length * 100 : 0
    };
  }
};
