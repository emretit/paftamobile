
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { 
  Opportunity, 
  OpportunityStatus, 
  ContactHistoryItem 
} from "@/types/crm";
import { Task, TaskStatus, TaskPriority, TaskType, SubTask } from "@/types/task";
import { Proposal } from "@/types/proposal";

// Mock data until Supabase tables are created
const mockOpportunities: Opportunity[] = [
  {
    id: uuidv4(),
    title: "Acme Corp. Software Purchase",
    description: "Potential sale of accounting software package",
    status: "new",
    priority: "high",
    value: 25000,
    customer_id: "1",
    employee_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    contact_history: [
      {
        id: uuidv4(),
        date: new Date().toISOString(),
        contact_type: "email",
        notes: "Initial contact about their software needs",
        employee_name: "Ahmet Yılmaz"
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Teknik A.Ş. Consulting Project",
    description: "Business process evaluation and improvement",
    status: "first_contact",
    priority: "medium",
    value: 15000,
    customer_id: "2",
    employee_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expected_close_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    contact_history: [
      {
        id: uuidv4(),
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        contact_type: "call",
        notes: "Discussed their pain points and possible solutions",
        employee_name: "Mehmet Demir"
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Yıldız Market POS System Upgrade",
    description: "Upgrading POS systems for all locations",
    status: "site_visit",
    priority: "high",
    value: 75000,
    customer_id: "3",
    employee_id: "2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    contact_history: []
  }
];

const mockTasks: Task[] = [
  {
    id: uuidv4(),
    title: "İlk görüşmeyi yap ve ziyaret planla",
    description: "Acme Corp. ile ilk toplantı",
    status: "todo" as TaskStatus,
    priority: "high" as TaskPriority,
    type: "meeting" as TaskType,
    assignee_id: "1",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    related_item_id: mockOpportunities[0]?.id,
    related_item_title: mockOpportunities[0]?.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: [
      {
        id: uuidv4(),
        title: "Toplantı gündemini hazırla",
        completed: true,
        task_id: "parent_task_id"
      },
      {
        id: uuidv4(),
        title: "Ürün demosunu hazırla",
        completed: false,
        task_id: "parent_task_id"
      }
    ]
  },
  {
    id: uuidv4(),
    title: "Teklif Hazırla",
    description: "Teknik A.Ş. için danışmanlık teklifi",
    status: "in_progress" as TaskStatus,
    priority: "medium" as TaskPriority,
    type: "proposal" as TaskType,
    assignee_id: "2",
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    related_item_id: mockOpportunities[1]?.id,
    related_item_title: mockOpportunities[1]?.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: []
  }
];

const mockProposals: Proposal[] = [
  {
    id: uuidv4(),
    title: "Teknik A.Ş. Danışmanlık Hizmetleri",
    customer_id: "2",
    opportunity_id: mockOpportunities[1].id,
    employee_id: "1",
    status: "draft",
    total_value: 15000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proposal_number: 1001,
    payment_terms: "30 gün vade",
    delivery_terms: "2 hafta içinde başlangıç",
    items: [
      {
        id: uuidv4(),
        name: "İş Süreci Analizi",
        description: "Mevcut süreçlerin detaylı analizi",
        quantity: 1,
        unit_price: 5000,
        tax_rate: 18,
        total_price: 5000
      },
      {
        id: uuidv4(),
        name: "Süreç İyileştirme Danışmanlığı",
        description: "Süreç iyileştirme ve optimizasyon çalışması",
        quantity: 2,
        unit_price: 5000,
        tax_rate: 18,
        total_price: 10000
      }
    ]
  }
];

// CRM API Service
export const crmService = {
  // Get all opportunities
  getOpportunities: async () => {
    try {
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('opportunities').select('*');
      
      // For now, return mock data
      return { data: mockOpportunities, error: null };
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      return { data: null, error };
    }
  },

  // Get a single opportunity by ID
  getOpportunity: async (id: string) => {
    try {
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
      
      // For now, return mock data
      const opportunity = mockOpportunities.find(o => o.id === id);
      return { data: opportunity || null, error: opportunity ? null : new Error('Opportunity not found') };
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      return { data: null, error };
    }
  },
  
  // Create a new opportunity
  createOpportunity: async (opportunityData: Partial<Opportunity>) => {
    try {
      const newOpportunity: Opportunity = {
        id: uuidv4(),
        title: opportunityData.title || 'New Opportunity',
        description: opportunityData.description || '',
        status: opportunityData.status || 'new',
        priority: opportunityData.priority || 'medium',
        value: opportunityData.value || 0,
        customer_id: opportunityData.customer_id,
        employee_id: opportunityData.employee_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expected_close_date: opportunityData.expected_close_date,
        notes: opportunityData.notes,
        contact_history: opportunityData.contact_history || []
      };
      
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('opportunities').insert(newOpportunity).select();
      
      // For now, add to mock data
      mockOpportunities.push(newOpportunity);
      
      // Create default first task for the new opportunity
      if (newOpportunity.id) {
        crmService.createTask({
          title: "İlk görüşmeyi yap ve ziyaret planla",
          description: `${newOpportunity.title} için ilk görüşme`,
          status: "todo" as TaskStatus,
          priority: "medium" as TaskPriority,
          type: "meeting" as TaskType,
          assignee_id: newOpportunity.employee_id,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          related_item_id: newOpportunity.id,
          related_item_title: newOpportunity.title
        });
      }
      
      return { data: newOpportunity, error: null };
    } catch (error) {
      console.error("Error creating opportunity:", error);
      return { data: null, error };
    }
  },
  
  // Update an opportunity
  updateOpportunity: async (id: string, opportunityData: Partial<Opportunity>) => {
    try {
      const index = mockOpportunities.findIndex(o => o.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Opportunity not found') };
      }
      
      const prevStatus = mockOpportunities[index].status;
      
      // Update the opportunity in our mock data
      mockOpportunities[index] = {
        ...mockOpportunities[index],
        ...opportunityData,
        updated_at: new Date().toISOString()
      };
      
      const updatedOpportunity = mockOpportunities[index];
      
      // If status changed, create appropriate task
      if (prevStatus !== opportunityData.status && opportunityData.status) {
        await this.createTaskForStatusChange(
          updatedOpportunity.id,
          updatedOpportunity.title,
          opportunityData.status as OpportunityStatus,
          updatedOpportunity.employee_id
        );
      }
      
      // In production, we would use Supabase
      // const { data, error } = await supabase
      //   .from('opportunities')
      //   .update({ ...opportunityData, updated_at: new Date().toISOString() })
      //   .eq('id', id)
      //   .select();
      
      return { data: updatedOpportunity, error: null };
    } catch (error) {
      console.error(`Error updating opportunity ${id}:`, error);
      return { data: null, error };
    }
  },
  
  // Add contact history entry to an opportunity
  addContactHistory: async (opportunityId: string, entry: Omit<ContactHistoryItem, 'id'>) => {
    try {
      const index = mockOpportunities.findIndex(o => o.id === opportunityId);
      if (index === -1) {
        return { data: null, error: new Error('Opportunity not found') };
      }
      
      const contactHistoryItem: ContactHistoryItem = {
        id: uuidv4(),
        ...entry,
        date: entry.date || new Date().toISOString()
      };
      
      if (!mockOpportunities[index].contact_history) {
        mockOpportunities[index].contact_history = [];
      }
      
      mockOpportunities[index].contact_history?.push(contactHistoryItem);
      
      // In production, we would use Supabase functions to append to the JSONB array
      // const { data, error } = await supabase.rpc('add_contact_history', {
      //   p_opportunity_id: opportunityId,
      //   p_contact_entry: contactHistoryItem
      // });
      
      return { data: contactHistoryItem, error: null };
    } catch (error) {
      console.error(`Error adding contact history to opportunity ${opportunityId}:`, error);
      return { data: null, error };
    }
  },
  
  // Delete an opportunity
  deleteOpportunity: async (id: string) => {
    try {
      const index = mockOpportunities.findIndex(o => o.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Opportunity not found') };
      }
      
      mockOpportunities.splice(index, 1);
      
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('opportunities').delete().eq('id', id);
      
      return { data: { id }, error: null };
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      return { data: null, error };
    }
  },
  
  // Create a task based on opportunity status change
  createTaskForStatusChange: async (
    opportunityId: string,
    opportunityTitle: string,
    newStatus: OpportunityStatus,
    assigneeId?: string
  ) => {
    let taskData: Partial<Task> = {
      related_item_id: opportunityId,
      related_item_title: opportunityTitle,
      assignee_id: assigneeId,
      status: "todo" as TaskStatus,
      priority: "medium" as TaskPriority,
      type: "opportunity" as TaskType
    };
    
    switch (newStatus) {
      case "new":
        taskData.title = "İlk görüşmeyi yap ve ziyaret planla";
        taskData.description = `${opportunityTitle} için ilk görüşme planlaması`;
        break;
      case "first_contact":
        taskData.title = "Ziyaret yap ve raporla";
        taskData.description = `${opportunityTitle} için müşteri ziyareti planla`;
        break;
      case "site_visit":
        taskData.title = "Teklif hazırla";
        taskData.description = `${opportunityTitle} için teklif hazırla`;
        taskData.type = "proposal" as TaskType;
        break;
      case "preparing_proposal":
        taskData.title = "Teklif onayı al";
        taskData.description = `${opportunityTitle} için hazırlanan teklifi kontrol et ve onaya sun`;
        taskData.type = "proposal" as TaskType;
        break;
      case "proposal_sent":
        taskData.title = "Teklif takibini yap";
        taskData.description = `${opportunityTitle} için gönderilen teklifin takibini yap`;
        taskData.due_date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "accepted":
        taskData.title = "Satış sözleşmesi hazırla";
        taskData.description = `${opportunityTitle} için satış sözleşmesi hazırla`;
        break;
      case "lost":
        taskData.title = "Fırsatı kapat ve kaybetme nedeni raporla";
        taskData.description = `${opportunityTitle} fırsatının kaybedilme nedenlerini analiz et`;
        break;
    }
    
    return await crmService.createTask(taskData);
  },
  
  // Get all tasks
  getTasks: async () => {
    try {
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('tasks').select('*');
      
      // For now, return mock data
      return { data: mockTasks, error: null };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return { data: null, error };
    }
  },
  
  // Get tasks for a specific opportunity
  getTasksForOpportunity: async (opportunityId: string) => {
    try {
      // In production, we would use Supabase
      // const { data, error } = await supabase
      //   .from('tasks')
      //   .select('*')
      //   .eq('related_item_id', opportunityId)
      //   .eq('type', 'opportunity');
      
      // For now, filter mock data
      const filteredTasks = mockTasks.filter(
        task => task.related_item_id === opportunityId && task.type === 'opportunity'
      );
      
      return { data: filteredTasks, error: null };
    } catch (error) {
      console.error(`Error fetching tasks for opportunity ${opportunityId}:`, error);
      return { data: null, error };
    }
  },
  
  // Create a new task
  createTask: async (taskData: Partial<Task>) => {
    try {
      const taskId = uuidv4();
      
      // Prepare subtasks if any
      const subtasks = taskData.subtasks 
        ? taskData.subtasks.map(subtask => ({
            ...subtask,
            task_id: taskId // Ensure task_id is set
          }))
        : [];
      
      const newTask: Task = {
        id: taskId,
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        status: taskData.status || 'todo' as TaskStatus,
        priority: taskData.priority || 'medium' as TaskPriority,
        type: taskData.type || 'general' as TaskType,
        assignee_id: taskData.assignee_id,
        assigned_to: taskData.assigned_to,
        due_date: taskData.due_date,
        related_item_id: taskData.related_item_id,
        related_item_title: taskData.related_item_title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subtasks: subtasks
      };
      
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('tasks').insert(newTask).select();
      
      // For now, add to mock data
      mockTasks.push(newTask);
      
      return { data: newTask, error: null };
    } catch (error) {
      console.error("Error creating task:", error);
      return { data: null, error };
    }
  },
  
  // Update a task
  updateTask: async (id: string, taskData: Partial<Task>) => {
    try {
      const index = mockTasks.findIndex(t => t.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Task not found') };
      }
      
      // Process subtasks if needed
      if (taskData.subtasks) {
        taskData.subtasks = taskData.subtasks.map(subtask => ({
          ...subtask,
          task_id: id
        }));
      }
      
      // Update the task in our mock data
      mockTasks[index] = {
        ...mockTasks[index],
        ...taskData,
        updated_at: new Date().toISOString()
      };
      
      // In production, we would use Supabase
      // const { data, error } = await supabase
      //   .from('tasks')
      //   .update({ ...taskData, updated_at: new Date().toISOString() })
      //   .eq('id', id)
      //   .select();
      
      return { data: mockTasks[index], error: null };
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      return { data: null, error };
    }
  },
  
  // Delete a task
  deleteTask: async (id: string) => {
    try {
      const index = mockTasks.findIndex(t => t.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Task not found') };
      }
      
      mockTasks.splice(index, 1);
      
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('tasks').delete().eq('id', id);
      
      return { data: { id }, error: null };
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      return { data: null, error };
    }
  },

  // Get all proposals
  getProposals: async () => {
    try {
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('proposals').select('*');
      
      // For now, return mock data
      return { data: mockProposals, error: null };
    } catch (error) {
      console.error("Error fetching proposals:", error);
      return { data: null, error };
    }
  },
  
  // Get a single proposal by ID
  getProposal: async (id: string) => {
    try {
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('proposals').select('*').eq('id', id).single();
      
      // For now, return mock data
      const proposal = mockProposals.find(p => p.id === id);
      return { data: proposal || null, error: proposal ? null : new Error('Proposal not found') };
    } catch (error) {
      console.error(`Error fetching proposal ${id}:`, error);
      return { data: null, error };
    }
  },
  
  // Create a new proposal
  createProposal: async (proposalData: Partial<Proposal>) => {
    try {
      const newProposal: Proposal = {
        id: uuidv4(),
        title: proposalData.title || 'New Proposal',
        customer_id: proposalData.customer_id || null,
        opportunity_id: proposalData.opportunity_id || null,
        employee_id: proposalData.employee_id || null,
        status: proposalData.status || 'draft',
        total_value: proposalData.total_value || 0,
        proposal_number: proposalData.proposal_number || Math.floor(1000 + Math.random() * 9000),
        payment_terms: proposalData.payment_terms,
        delivery_terms: proposalData.delivery_terms,
        notes: proposalData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: proposalData.items || []
      };
      
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('proposals').insert(newProposal).select();
      
      // For now, add to mock data
      mockProposals.push(newProposal);
      
      // If this proposal is linked to an opportunity, update the opportunity status
      if (newProposal.opportunity_id) {
        const opportunity = mockOpportunities.find(o => o.id === newProposal.opportunity_id);
        if (opportunity) {
          if (newProposal.status === 'draft' || newProposal.status === 'pending_approval') {
            this.updateOpportunity(opportunity.id, { status: 'preparing_proposal' });
          } else if (newProposal.status === 'sent') {
            this.updateOpportunity(opportunity.id, { status: 'proposal_sent' });
          }
        }
      }
      
      return { data: newProposal, error: null };
    } catch (error) {
      console.error("Error creating proposal:", error);
      return { data: null, error };
    }
  },
  
  // Update a proposal
  updateProposal: async (id: string, proposalData: Partial<Proposal>) => {
    try {
      const index = mockProposals.findIndex(p => p.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Proposal not found') };
      }
      
      const prevStatus = mockProposals[index].status;
      
      // Update the proposal in our mock data
      mockProposals[index] = {
        ...mockProposals[index],
        ...proposalData,
        updated_at: new Date().toISOString()
      };
      
      const updatedProposal = mockProposals[index];
      
      // If status changed, update the related opportunity status
      if (prevStatus !== proposalData.status && proposalData.status && updatedProposal.opportunity_id) {
        const opportunity = mockOpportunities.find(o => o.id === updatedProposal.opportunity_id);
        if (opportunity) {
          if (proposalData.status === 'sent') {
            this.updateOpportunity(opportunity.id, { status: 'proposal_sent' });
          } else if (proposalData.status === 'accepted') {
            this.updateOpportunity(opportunity.id, { status: 'accepted' });
          } else if (proposalData.status === 'rejected') {
            this.updateOpportunity(opportunity.id, { status: 'lost' });
          }
        }
      }
      
      // In production, we would use Supabase
      // const { data, error } = await supabase
      //   .from('proposals')
      //   .update({ ...proposalData, updated_at: new Date().toISOString() })
      //   .eq('id', id)
      //   .select();
      
      return { data: updatedProposal, error: null };
    } catch (error) {
      console.error(`Error updating proposal ${id}:`, error);
      return { data: null, error };
    }
  },
  
  // Delete a proposal
  deleteProposal: async (id: string) => {
    try {
      const index = mockProposals.findIndex(p => p.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Proposal not found') };
      }
      
      mockProposals.splice(index, 1);
      
      // In production, we would use Supabase
      // const { data, error } = await supabase.from('proposals').delete().eq('id', id);
      
      return { data: { id }, error: null };
    } catch (error) {
      console.error(`Error deleting proposal ${id}:`, error);
      return { data: null, error };
    }
  }
};

export default crmService;
