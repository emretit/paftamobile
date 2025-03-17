
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, OpportunityStatus, OpportunityExtended, ContactHistoryEntry } from "@/types/crm";
import { Task } from "@/types/task";

// This is a temporary mock service to handle CRM operations
// until the actual Supabase tables are created

// Mock data storage
let opportunities: OpportunityExtended[] = [
  {
    id: "1",
    title: "Enterprise Software Implementation",
    description: "Implementation of custom ERP solution",
    status: "new",
    priority: "high",
    value: 150000,
    customer_id: "c1",
    employee_id: "e1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expected_close_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    customer_name: "Acme Corporation",
    employee_name: "John Doe",
    currency: "₺",
    contact_history: []
  },
  {
    id: "2",
    title: "Cloud Migration Project",
    description: "Migrating on-premise servers to cloud",
    status: "first_contact",
    priority: "medium",
    value: 85000,
    customer_id: "c2",
    employee_id: "e2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_name: "TechStart Inc.",
    employee_name: "Jane Smith",
    currency: "₺",
    contact_history: []
  },
  {
    id: "3",
    title: "Security Assessment",
    description: "Complete security audit and improvement plan",
    status: "site_visit",
    priority: "high",
    value: 45000,
    customer_id: "c3",
    employee_id: "e1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_name: "Secure Systems Ltd.",
    employee_name: "John Doe",
    currency: "₺",
    contact_history: []
  }
];

// Mock deals data (since we don't have a "deals" table in Supabase yet)
let deals = [
  {
    id: "1",
    title: "Enterprise Deal",
    value: 150000,
    status: "new",
    customerName: "Acme Corporation",
    employeeName: "John Doe",
    priority: "high"
  },
  {
    id: "2",
    title: "Cloud Migration Deal",
    value: 85000,
    status: "negotiation",
    customerName: "TechStart Inc.",
    employeeName: "Jane Smith",
    priority: "medium"
  },
  {
    id: "3",
    title: "Security Assessment Deal",
    value: 45000,
    status: "follow_up",
    customerName: "Secure Systems Ltd.",
    employeeName: "John Doe",
    priority: "high"
  }
];

// Mock tasks data
let tasks = [
  {
    id: "1",
    title: "Call Client",
    description: "Make initial call to discuss requirements",
    status: "todo",
    priority: "medium",
    type: "call",
    assignee_id: "e1",
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: []
  }
];

// Mock API functions that mimic Supabase calls
export const mockOpportunitiesAPI = {
  // Get all opportunities
  getOpportunities: async () => {
    return { data: opportunities, error: null };
  },
  
  // Filter opportunities
  filterOpportunities: async (query: string, employeeId?: string, customerId?: string) => {
    let filteredOpps = [...opportunities];
    
    if (query) {
      filteredOpps = filteredOpps.filter(
        opp => opp.title.toLowerCase().includes(query.toLowerCase()) || 
               (opp.description && opp.description.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    if (employeeId) {
      filteredOpps = filteredOpps.filter(opp => opp.employee_id === employeeId);
    }
    
    if (customerId) {
      filteredOpps = filteredOpps.filter(opp => opp.customer_id === customerId);
    }
    
    return { data: filteredOpps, error: null };
  },
  
  // Get single opportunity
  getOpportunity: async (id: string) => {
    const opportunity = opportunities.find(opp => opp.id === id);
    return { data: opportunity, error: opportunity ? null : new Error('Opportunity not found') };
  },
  
  // Update opportunity
  updateOpportunity: async (id: string, updates: Partial<OpportunityExtended>) => {
    const index = opportunities.findIndex(opp => opp.id === id);
    if (index === -1) {
      return { data: null, error: new Error('Opportunity not found') };
    }
    
    opportunities[index] = {
      ...opportunities[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return { data: opportunities[index], error: null };
  },
  
  // Create opportunity
  createOpportunity: async (newOpportunity: Partial<OpportunityExtended>) => {
    const createdOpp: OpportunityExtended = {
      id: `opp-${Date.now()}`,
      title: newOpportunity.title || 'New Opportunity',
      description: newOpportunity.description,
      status: newOpportunity.status || 'new',
      priority: newOpportunity.priority || 'medium',
      value: newOpportunity.value || 0,
      customer_id: newOpportunity.customer_id,
      employee_id: newOpportunity.employee_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expected_close_date: newOpportunity.expected_close_date,
      last_contact_date: newOpportunity.last_contact_date,
      notes: newOpportunity.notes,
      customer_name: newOpportunity.customer_name,
      employee_name: newOpportunity.employee_name,
      currency: newOpportunity.currency || "₺",
      contact_history: newOpportunity.contact_history || []
    };
    
    opportunities.push(createdOpp);
    return { data: createdOpp, error: null };
  },
  
  // Update contact history
  updateContactHistory: async (opportunityId: string, contactHistory: ContactHistoryEntry[]) => {
    const index = opportunities.findIndex(opp => opp.id === opportunityId);
    if (index === -1) {
      return { data: null, error: new Error('Opportunity not found') };
    }
    
    opportunities[index].contact_history = contactHistory;
    opportunities[index].updated_at = new Date().toISOString();
    
    return { data: opportunities[index], error: null };
  }
};

// Mock deals API
export const mockDealsAPI = {
  getDeals: async () => {
    return { data: deals, error: null };
  },
  
  getDealCountsByStatus: async () => {
    const counts: {status: string, count: number}[] = [];
    const statusCounts = deals.reduce((acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      counts.push({ status, count });
    });
    
    return { data: counts, error: null };
  },
  
  updateDeal: async (id: string, updates: any) => {
    const index = deals.findIndex(deal => deal.id === id);
    if (index === -1) {
      return { error: new Error('Deal not found') };
    }
    
    deals[index] = { ...deals[index], ...updates };
    return { data: deals[index], error: null };
  }
};

// Mock tasks API
export const mockTasksAPI = {
  getTasks: async () => {
    return { data: tasks, error: null };
  },
  
  createTask: async (taskData: any) => {
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: taskData.subtasks || []
    };
    
    tasks.push(newTask);
    return { data: newTask, error: null };
  },
  
  updateTask: async (id: string, updates: any) => {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) {
      return { error: new Error('Task not found') };
    }
    
    tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() };
    return { data: tasks[index], error: null };
  }
};

// Export patched supabase object that replaces calls to non-existent tables with mock implementations
export const crmSupabase = {
  ...supabase,
  from: (table: string) => {
    if (table === 'opportunities') {
      return {
        select: (query?: string) => ({
          eq: (field: string, value: any) => ({
            single: async () => {
              const opportunity = opportunities.find(opp => opp[field as keyof OpportunityExtended] === value);
              return { data: opportunity, error: opportunity ? null : new Error('Opportunity not found') };
            }
          }),
          or: (query: string) => ({
            eq: (field: string, value: any) => mockOpportunitiesAPI.filterOpportunities(query, field === 'employee_id' ? value : undefined, field === 'customer_id' ? value : undefined)
          }),
          eq: (field: string, value: any) => mockOpportunitiesAPI.filterOpportunities('', field === 'employee_id' ? value : undefined, field === 'customer_id' ? value : undefined)
        }),
        update: (updates: Partial<OpportunityExtended>) => ({
          eq: (field: string, value: any) => {
            const opportunity = opportunities.find(opp => opp[field as keyof OpportunityExtended] === value);
            if (!opportunity) {
              return { data: null, error: new Error('Opportunity not found') };
            }
            return mockOpportunitiesAPI.updateOpportunity(opportunity.id, updates);
          }
        }),
        insert: (newOpportunities: Partial<OpportunityExtended>[]) => ({
          select: () => ({
            single: async () => {
              const createdOpp = await mockOpportunitiesAPI.createOpportunity(newOpportunities[0]);
              return createdOpp;
            }
          })
        })
      };
    } else if (table === 'deals') {
      return {
        select: (query?: string) => {
          return {
            eq: (field: string, value: any) => {
              const deal = deals.find(d => d[field as keyof typeof d] === value);
              return { data: deal, error: null };
            },
            count: async (options?: { head?: boolean }) => {
              return { count: deals.length, error: null };
            },
            single: async () => {
              const deal = deals[0];
              return { data: deal, error: null };
            }
          };
        },
        update: (updates: any) => ({
          eq: (field: string, value: any) => mockDealsAPI.updateDeal(value, updates)
        })
      };
    } else if (table === 'tasks') {
      return {
        select: () => {
          return {
            data: tasks,
            error: null
          };
        },
        insert: (newTask: any) => {
          return mockTasksAPI.createTask(Array.isArray(newTask) ? newTask[0] : newTask);
        },
        update: (updates: any) => ({
          eq: (field: string, value: any) => mockTasksAPI.updateTask(value, updates)
        }),
        delete: () => ({
          eq: (field: string, value: any) => {
            const index = tasks.findIndex(task => task[field as keyof typeof task] === value);
            if (index !== -1) {
              tasks.splice(index, 1);
            }
            return { error: null };
          }
        })
      };
    }
    
    // Return the real supabase implementation for other tables
    return supabase.from(table);
  },
  rpc: (func: string, params?: any) => {
    if (func === 'get_deal_counts_by_status') {
      return mockDealsAPI.getDealCountsByStatus();
    }
    
    // Fall back to actual supabase RPC
    return supabase.rpc(func, params);
  }
};
