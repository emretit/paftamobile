
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority, TaskType } from "@/types/task";
import { Deal } from "@/types/deal";
import { Opportunity, OpportunityStatus, OpportunityPriority } from "@/types/crm";
import { ProposalStatusShared } from "@/types/shared-types";
import { toast } from "sonner";

// Sample data for mock services
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Contact new lead",
    description: "Follow up with the new lead from website",
    status: "todo",
    priority: "high",
    type: "general",
    assignee_id: "1",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: []
  },
  {
    id: "2",
    title: "Prepare proposal",
    description: "Prepare proposal for Tech Corp",
    status: "in_progress",
    priority: "medium",
    type: "proposal",
    assignee_id: "2",
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: []
  }
];

// Mock opportunities
const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    title: "Enterprise Software Package",
    description: "Complete enterprise software solution",
    status: "new",
    priority: "high",
    value: 50000,
    customer_id: "1",
    employee_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact_date: new Date().toISOString(),
    customer_name: "Tech Corp",
    employee_name: "John Smith"
  },
  {
    id: "2",
    title: "Cloud Migration Project",
    description: "Migrate on-premise infrastructure to cloud",
    status: "proposal_sent",
    priority: "medium",
    value: 35000,
    customer_id: "2",
    employee_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_contact_date: new Date().toISOString(),
    customer_name: "Acme Inc",
    employee_name: "John Smith"
  }
];

// Mock CRM service for tasks
export const mockTasksAPI = {
  // Get all tasks
  getTasks: async () => {
    try {
      // Try to get real tasks from Supabase
      const { data, error } = await supabase.from("tasks").select("*");
      
      if (error) {
        console.error("Error fetching tasks from Supabase:", error);
        return { data: mockTasks, error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in getTasks:", error);
      return { data: mockTasks, error };
    }
  },
  
  // Create a new task
  createTask: async (taskData: Partial<Task>) => {
    try {
      // Try to create task in Supabase
      const { data, error } = await supabase.from("tasks").insert([taskData]).select();
      
      if (error) {
        console.error("Error creating task in Supabase:", error);
        // Fall back to mock data
        const newTask = {
          id: `mock-${Date.now()}`,
          ...taskData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Task;
        
        mockTasks.push(newTask);
        return { data: [newTask], error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in createTask:", error);
      return { data: null, error };
    }
  },
  
  // Update a task
  updateTask: async (id: string, updates: Partial<Task>) => {
    try {
      // Try to update task in Supabase
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select();
      
      if (error) {
        console.error("Error updating task in Supabase:", error);
        // Fall back to mock data
        const index = mockTasks.findIndex(task => task.id === id);
        if (index !== -1) {
          mockTasks[index] = { ...mockTasks[index], ...updates, updated_at: new Date().toISOString() };
          return { data: [mockTasks[index]], error: null };
        }
        return { data: null, error: new Error("Task not found") };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in updateTask:", error);
      return { data: null, error };
    }
  },

  // Delete a task
  deleteTask: async (id: string) => {
    try {
      // Try to delete task in Supabase
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      
      if (error) {
        console.error("Error deleting task in Supabase:", error);
        // Fall back to mock data
        const index = mockTasks.findIndex(task => task.id === id);
        if (index !== -1) {
          mockTasks.splice(index, 1);
          return { success: true, error: null };
        }
        return { success: false, error: new Error("Task not found") };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error in deleteTask:", error);
      return { success: false, error };
    }
  }
};

// Mock CRM service for opportunities
export const mockOpportunitiesAPI = {
  // Get all opportunities
  getOpportunities: async () => {
    try {
      // Try to get real opportunities from Supabase
      const { data, error } = await supabase.from("opportunities").select("*");
      
      if (error) {
        console.error("Error fetching opportunities from Supabase:", error);
        return { data: mockOpportunities, error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in getOpportunities:", error);
      return { data: mockOpportunities, error };
    }
  },
  
  // Filter opportunities
  filterOpportunities: async (query: string, employeeId?: string, customerId?: string) => {
    try {
      // Use real filter if possible
      let dbQuery = supabase.from("opportunities").select("*");
      
      if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }
      
      if (employeeId) {
        dbQuery = dbQuery.eq("employee_id", employeeId);
      }
      
      if (customerId) {
        dbQuery = dbQuery.eq("customer_id", customerId);
      }
      
      const { data, error } = await dbQuery;
      
      if (error) {
        console.error("Error filtering opportunities in Supabase:", error);
        // Fall back to mock filtering
        let filtered = mockOpportunities;
        
        if (query) {
          const lowerQuery = query.toLowerCase();
          filtered = filtered.filter(opp => 
            opp.title.toLowerCase().includes(lowerQuery) || 
            (opp.description && opp.description.toLowerCase().includes(lowerQuery))
          );
        }
        
        if (employeeId) {
          filtered = filtered.filter(opp => opp.employee_id === employeeId);
        }
        
        if (customerId) {
          filtered = filtered.filter(opp => opp.customer_id === customerId);
        }
        
        return { data: filtered, error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in filterOpportunities:", error);
      return { data: [], error };
    }
  },
  
  // Get an opportunity by ID
  getOpportunity: async (id: string) => {
    try {
      // Try to get real opportunity from Supabase
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching opportunity from Supabase:", error);
        // Fall back to mock data
        const opportunity = mockOpportunities.find(opp => opp.id === id);
        if (!opportunity) {
          return { data: null, error: new Error("Opportunity not found") };
        }
        return { data: opportunity, error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in getOpportunity:", error);
      return { data: null, error };
    }
  },
  
  // Update an opportunity
  updateOpportunity: async (id: string, updates: Partial<Opportunity>) => {
    try {
      // Try to update opportunity in Supabase
      const { data, error } = await supabase
        .from("opportunities")
        .update(updates)
        .eq("id", id)
        .select();
      
      if (error) {
        console.error("Error updating opportunity in Supabase:", error);
        // Fall back to mock data
        const index = mockOpportunities.findIndex(opp => opp.id === id);
        if (index !== -1) {
          mockOpportunities[index] = { 
            ...mockOpportunities[index], 
            ...updates, 
            updated_at: new Date().toISOString() 
          };
          return { data: mockOpportunities[index], error: null };
        }
        return { data: null, error: new Error("Opportunity not found") };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in updateOpportunity:", error);
      return { data: null, error };
    }
  },
  
  // Create a new opportunity
  createOpportunity: async (newOpportunity: Partial<Opportunity>) => {
    try {
      // Try to create opportunity in Supabase
      const { data, error } = await supabase
        .from("opportunities")
        .insert([newOpportunity])
        .select();
      
      if (error) {
        console.error("Error creating opportunity in Supabase:", error);
        // Fall back to mock data
        const opportunity = {
          id: `mock-${Date.now()}`,
          ...newOpportunity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Opportunity;
        
        mockOpportunities.push(opportunity);
        return { data: opportunity, error: null };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error("Error in createOpportunity:", error);
      return { data: null, error };
    }
  },
  
  // Delete an opportunity
  deleteOpportunity: async (id: string) => {
    try {
      // Try to delete opportunity in Supabase
      const { error } = await supabase.from("opportunities").delete().eq("id", id);
      
      if (error) {
        console.error("Error deleting opportunity in Supabase:", error);
        // Fall back to mock data
        const index = mockOpportunities.findIndex(opp => opp.id === id);
        if (index !== -1) {
          mockOpportunities.splice(index, 1);
          return { success: true, error: null };
        }
        return { success: false, error: new Error("Opportunity not found") };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error in deleteOpportunity:", error);
      return { success: false, error };
    }
  },

  // Update opportunity based on proposal changes
  updateOpportunityBasedOnProposal: async (
    proposalId: string, 
    proposalStatus: ProposalStatusShared, 
    opportunityId: string
  ) => {
    try {
      // Map proposal status to opportunity status
      let opportunityStatus: OpportunityStatus;
      
      switch (proposalStatus) {
        case "sent":
        case "gonderildi":
          opportunityStatus = "proposal_sent";
          break;
        case "accepted":
          opportunityStatus = "accepted";
          break;
        case "rejected":
          opportunityStatus = "lost";
          break;
        default:
          opportunityStatus = "preparing_proposal";
      }
      
      const result = await mockOpportunitiesAPI.updateOpportunity(opportunityId, { 
        status: opportunityStatus 
      });
      
      if (result.error) {
        throw result.error;
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error updating opportunity based on proposal:", error);
      return { success: false, error };
    }
  }
};

// Mock service for dealing with deals (legacy - now using opportunities)
export const mockDealsAPI = {
  // Forward all calls to opportunities API
  getDeal: (id: string) => mockOpportunitiesAPI.getOpportunity(id),
  getDeals: () => mockOpportunitiesAPI.getOpportunities(),
  updateDeal: (id: string, updates: any) => mockOpportunitiesAPI.updateOpportunity(id, updates),
  createDeal: (newDeal: any) => mockOpportunitiesAPI.createOpportunity(newDeal),
  deleteDeal: (id: string) => mockOpportunitiesAPI.deleteOpportunity(id)
};

// Unified mock CRM service
export const mockCrmService = {
  // Tasks
  getTasks: mockTasksAPI.getTasks,
  createTask: mockTasksAPI.createTask,
  updateTask: mockTasksAPI.updateTask,
  deleteTask: mockTasksAPI.deleteTask,
  
  // Opportunities
  getOpportunities: mockOpportunitiesAPI.getOpportunities,
  filterOpportunities: mockOpportunitiesAPI.filterOpportunities,
  getOpportunity: mockOpportunitiesAPI.getOpportunity,
  updateOpportunity: mockOpportunitiesAPI.updateOpportunity,
  createOpportunity: mockOpportunitiesAPI.createOpportunity,
  deleteOpportunity: mockOpportunitiesAPI.deleteOpportunity,
  updateOpportunityBasedOnProposal: mockOpportunitiesAPI.updateOpportunityBasedOnProposal,
  
  // Deals (legacy API - redirects to opportunities)
  getDeal: mockDealsAPI.getDeal,
  getDeals: mockDealsAPI.getDeals,
  updateDeal: mockDealsAPI.updateDeal,
  createDeal: mockDealsAPI.createDeal,
  deleteDeal: mockDealsAPI.deleteDeal
};
