import { supabase } from '@/integrations/supabase/client';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { Proposal, ProposalStatus } from '@/types/proposal';
import { 
  Opportunity, 
  OpportunityStatus, 
  ContactHistoryItem,
  OpportunityPriority
} from '@/types/crm';
import { v4 as uuidv4 } from 'uuid';

// Get all tasks
export const getTasks = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assigned_to(id, first_name, last_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { data: [], error };
  }
};

export const mockOpportunitiesAPI = {
  async getOpportunities() {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Error fetching opportunities:", error);
        return { data: [], error };
      }

      // Convert contact_history from JSON to array if needed
      const opportunities = data.map(opp => ({
        ...opp,
        contact_history: opp.contact_history ? 
          (typeof opp.contact_history === 'string' ? 
            JSON.parse(opp.contact_history) : opp.contact_history) : []
      }));

      return { data: opportunities, error: null };
    } catch (error) {
      console.error("Error in getOpportunities:", error);
      return { data: [], error };
    }
  },
  
  async filterOpportunities(
    searchQuery: string,
    employeeId?: string,
    customerId?: string
  ) {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .order('updated_at', { ascending: false });
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error filtering opportunities:", error);
        return { data: [], error };
      }
      
      const opportunities = data.map(opp => ({
        ...opp,
        contact_history: opp.contact_history ? 
          (typeof opp.contact_history === 'string' ? 
            JSON.parse(opp.contact_history) : opp.contact_history) : []
      }));
      
      return { data: opportunities, error: null };
    } catch (error) {
      console.error("Error in filterOpportunities:", error);
      return { data: [], error };
    }
  },
  
  async getOpportunity(id: string) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching opportunity:", error);
        return { data: null, error };
      }
      
      const opportunity = {
        ...data,
        contact_history: data.contact_history ? 
          (typeof data.contact_history === 'string' ? 
            JSON.parse(data.contact_history) : data.contact_history) : []
      };
      
      return { data: opportunity, error: null };
    } catch (error) {
      console.error("Error in getOpportunity:", error);
      return { data: null, error };
    }
  },
  
  async createOpportunity(opportunity: Partial<Opportunity>) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert([
          {
            ...opportunity,
            id: uuidv4(),
            contact_history: JSON.stringify([])
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating opportunity:", error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in createOpportunity:", error);
      return { data: null, error };
    }
  },
  
  async updateOpportunity(id: string, updates: Partial<Opportunity>) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating opportunity:", error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in updateOpportunity:", error);
      return { data: null, error };
    }
  },
  
  async deleteOpportunity(id: string) {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting opportunity:", error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error in deleteOpportunity:", error);
      return { success: false, error };
    }
  },
  
  async addContactHistory(opportunityId: string, contactHistoryItem: ContactHistoryItem) {
    try {
      // Fetch the existing opportunity to get the current contact history
      const { data: opportunityData, error: fetchError } = await supabase
        .from('opportunities')
        .select('contact_history')
        .eq('id', opportunityId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching opportunity for contact history update:", fetchError);
        return { data: null, error: fetchError };
      }
      
      // Parse the existing contact history or initialize an empty array
      const existingHistory = opportunityData?.contact_history 
        ? (typeof opportunityData.contact_history === 'string' 
            ? JSON.parse(opportunityData.contact_history) 
            : opportunityData.contact_history) 
        : [];
      
      // Add the new contact history item
      const updatedHistory = [...existingHistory, { ...contactHistoryItem, id: uuidv4() }];
      
      // Update the opportunity with the new contact history
      const { data: updateData, error: updateError } = await supabase
        .from('opportunities')
        .update({ contact_history: JSON.stringify(updatedHistory) })
        .eq('id', opportunityId)
        .select()
        .single();
      
      if (updateError) {
        console.error("Error updating opportunity with contact history:", updateError);
        return { data: null, error: updateError };
      }
      
      return { data: updateData, error: null };
    } catch (error) {
      console.error("Error in addContactHistory:", error);
      return { data: null, error };
    }
  },
  
  async updateContactHistoryItem(opportunityId: string, contactHistoryItem: ContactHistoryItem) {
    try {
      // Fetch the existing opportunity to get the current contact history
      const { data: opportunityData, error: fetchError } = await supabase
        .from('opportunities')
        .select('contact_history')
        .eq('id', opportunityId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching opportunity for contact history update:", fetchError);
        return { data: null, error: fetchError };
      }
      
      // Parse the existing contact history
      const existingHistory = opportunityData?.contact_history
        ? (typeof opportunityData.contact_history === 'string'
            ? JSON.parse(opportunityData.contact_history)
            : opportunityData.contact_history)
        : [];
      
      // Update the contact history item
      const updatedHistory = existingHistory.map(item =>
        item.id === contactHistoryItem.id ? contactHistoryItem : item
      );
      
      // Update the opportunity with the updated contact history
      const { data: updateData, error: updateError } = await supabase
        .from('opportunities')
        .update({ contact_history: JSON.stringify(updatedHistory) })
        .eq('id', opportunityId)
        .select()
        .single();
      
      if (updateError) {
        console.error("Error updating opportunity with contact history:", updateError);
        return { data: null, error: updateError };
      }
      
      return { data: updateData, error: null };
    } catch (error) {
      console.error("Error in updateContactHistoryItem:", error);
      return { data: null, error };
    }
  },
  
  async deleteContactHistoryItem(opportunityId: string, contactHistoryItemId: string) {
    try {
      // Fetch the existing opportunity to get the current contact history
      const { data: opportunityData, error: fetchError } = await supabase
        .from('opportunities')
        .select('contact_history')
        .eq('id', opportunityId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching opportunity for contact history update:", fetchError);
        return { data: null, error: fetchError };
      }
      
      // Parse the existing contact history
      const existingHistory = opportunityData?.contact_history
        ? (typeof opportunityData.contact_history === 'string'
            ? JSON.parse(opportunityData.contact_history)
            : opportunityData.contact_history)
        : [];
      
      // Delete the contact history item
      const updatedHistory = existingHistory.filter(item => item.id !== contactHistoryItemId);
      
      // Update the opportunity with the updated contact history
      const { data: updateData, error: updateError } = await supabase
        .from('opportunities')
        .update({ contact_history: JSON.stringify(updatedHistory) })
        .eq('id', opportunityId)
        .select()
        .single();
      
      if (updateError) {
        console.error("Error updating opportunity with contact history:", updateError);
        return { data: null, error: updateError };
      }
      
      return { data: updateData, error: null };
    } catch (error) {
      console.error("Error in deleteContactHistoryItem:", error);
      return { data: null, error };
    }
  }
};

export const mockTasksAPI = {
  async getTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assigned_to(id, first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching tasks:", error);
        return { data: [], error };
      }
      
      // Convert subtasks from JSON to array if needed
      const tasks = data.map(task => ({
        ...task,
        subtasks: task.subtasks ? 
          (typeof task.subtasks === 'string' ? 
            JSON.parse(task.subtasks) : task.subtasks) : []
      }));
      
      return { data: tasks, error: null };
    } catch (error) {
      console.error("Error in getTasks:", error);
      return { data: [], error };
    }
  },
  
  async createTask(task: any) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...task,
            id: uuidv4()
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating task:", error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in createTask:", error);
      return { data: null, error };
    }
  },
  
  async updateTask(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating task:", error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in updateTask:", error);
      return { data: null, error };
    }
  },
  
  async deleteTask(id: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting task:", error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error in deleteTask:", error);
      return { success: false, error };
    }
  }
};

