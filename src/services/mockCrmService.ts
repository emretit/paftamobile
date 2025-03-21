
import { supabase } from '@/integrations/supabase/client';
import { Opportunity, OpportunityStatus, ContactHistoryItem } from '@/types/crm';
import { Proposal, ProposalStatus, ProposalItem } from '@/types/proposal';
import { Task, TaskStatus, SubTask } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';

// Type alias for JSON compatibility with Supabase
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

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
      return { data: data as unknown as Task[], error: null };
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
      
      // Convert subtasks to proper format if they exist
      const taskWithSubtasks = {
        ...data,
        subtasks: Array.isArray(data.subtasks) ? data.subtasks as unknown as SubTask[] : []
      } as unknown as Task;
      
      return { data: taskWithSubtasks, error: null };
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
      
      // Transform proposals to ensure items are properly cast
      const proposals = data.map(proposal => ({
        ...proposal,
        items: Array.isArray(proposal.items) ? proposal.items as unknown as ProposalItem[] : []
      })) as unknown as Proposal[];
      
      return { data: proposals, error: null };
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
      
      // Transform proposal to ensure items are properly cast
      const proposal = {
        ...data,
        items: Array.isArray(data.items) ? data.items as unknown as ProposalItem[] : []
      } as unknown as Proposal;
      
      return { data: proposal, error: null };
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
      
      // Transform opportunities to ensure contact history is properly cast
      const opportunities = data.map(opportunity => ({
        ...opportunity,
        contact_history: Array.isArray(opportunity.contact_history) 
          ? opportunity.contact_history as unknown as ContactHistoryItem[]
          : []
      })) as unknown as Opportunity[];
      
      return { data: opportunities, error: null };
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
      
      // Transform opportunity to ensure contact history is properly cast
      const opportunity = {
        ...data,
        contact_history: Array.isArray(data.contact_history) 
          ? data.contact_history as unknown as ContactHistoryItem[]
          : []
      } as unknown as Opportunity;
      
      return { data: opportunity, error: null };
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
  },
  
  // Adding the missing exports needed by crmWorkflowService.ts
  updateOpportunity: async (id: string, updateData: Partial<Opportunity>) => {
    try {
      // Need to handle contact_history specifically to convert to JSON
      const dataToUpdate: any = { ...updateData };
      
      // Handle contact_history conversion if present
      if (updateData.contact_history) {
        dataToUpdate.contact_history = JSON.stringify(updateData.contact_history);
      }
      
      const { data, error } = await supabase
        .from('opportunities')
        .update(dataToUpdate)
        .eq('id', id)
        .select(`
          *,
          customer:customer_id (*),
          employee:employee_id (*)
        `)
        .single();

      if (error) throw error;
      
      // Properly cast the returned data
      const opportunity = {
        ...data,
        contact_history: Array.isArray(data.contact_history) 
          ? data.contact_history as unknown as ContactHistoryItem[]
          : []
      } as unknown as Opportunity;
      
      return { data: opportunity, error: null };
    } catch (error) {
      console.error('Error updating opportunity:', error);
      return { data: null, error };
    }
  }
};

// Exporting a mockTasksAPI object for use in crmWorkflowService.ts
export const mockTasksAPI = {
  createTask: async (taskData: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          id: uuidv4(),
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          type: taskData.type,
          assignee_id: taskData.assigned_to,
          due_date: taskData.due_date,
          related_item_id: taskData.related_item_id,
          related_item_type: taskData.related_item_type,
          related_item_title: taskData.related_item_title,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as unknown as Task, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      return { data: null, error };
    }
  },
  
  updateTask: async (id: string, updateData: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as unknown as Task, error: null };
    } catch (error) {
      console.error('Error updating task:', error);
      return { data: null, error };
    }
  }
};
