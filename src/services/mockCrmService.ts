
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
    }
    
    // Return the real supabase implementation for other tables
    return supabase.from(table);
  }
};
