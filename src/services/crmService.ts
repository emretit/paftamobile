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

export const crmService = {
  getOpportunities: async () => {
    try {
      return { data: mockOpportunities, error: null };
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      return { data: null, error };
    }
  },

  getOpportunity: async (id: string) => {
    try {
      const opportunity = mockOpportunities.find(o => o.id === id);
      return { data: opportunity || null, error: opportunity ? null : new Error('Opportunity not found') };
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      return { data: null, error };
    }
  },
  
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
      
      mockOpportunities.push(newOpportunity);
      
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
  
  updateOpportunity: async (id: string, opportunityData: Partial<Opportunity>) => {
    try {
      const index = mockOpportunities.findIndex(o => o.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Opportunity not found') };
      }
      
      const prevStatus = mockOpportunities[index].status;
      
      mockOpportunities[index] = {
        ...mockOpportunities[index],
        ...opportunityData,
        updated_at: new Date().toISOString()
      };
      
      const updatedOpportunity = mockOpportunities[index];
      
      if (prevStatus !== opportunityData.status && opportunityData.status) {
        await crmService.createTaskForStatusChange(
          updatedOpportunity.id,
          updatedOpportunity.title,
          opportunityData.status as OpportunityStatus,
          updatedOpportunity.employee_id
        );
      }
      
      return { data: updatedOpportunity, error: null };
    } catch (error) {
      console.error(`Error updating opportunity ${id}:`, error);
      return { data: null, error };
    }
  },
  
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
      
      return { data: contactHistoryItem, error: null };
    } catch (error) {
      console.error(`Error adding contact history to opportunity ${opportunityId}:`, error);
      return { data: null, error };
    }
  },
  
  deleteOpportunity: async (id: string) => {
    try {
      const index = mockOpportunities.findIndex(o => o.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Opportunity not found') };
      }
      
      mockOpportunities.splice(index, 1);
      
      return { data: { id }, error: null };
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      return { data: null, error };
    }
  },
  
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
  
  getTasks: async () => {
    try {
      return { data: mockTasks, error: null };
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return { data: null, error };
    }
  },
  
  getTasksForOpportunity: async (opportunityId: string) => {
    try {
      const filteredTasks = mockTasks.filter(
        task => task.related_item_id === opportunityId && task.type === 'opportunity'
      );
      
      return { data: filteredTasks, error: null };
    } catch (error) {
      console.error(`Error fetching tasks for opportunity ${opportunityId}:`, error);
      return { data: null, error };
    }
  },
  
  createTask: async (taskData: Partial<Task>) => {
    try {
      const taskId = uuidv4();
      
      const subtasks = taskData.subtasks 
        ? taskData.subtasks.map(subtask => ({
            ...subtask,
            task_id: taskId
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
      
      mockTasks.push(newTask);
      
      return { data: newTask, error: null };
    } catch (error) {
      console.error("Error creating task:", error);
      return { data: null, error };
    }
  },
  
  updateTask: async (id: string, taskData: Partial<Task>) => {
    try {
      const index = mockTasks.findIndex(t => t.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Task not found') };
      }
      
      if (taskData.subtasks) {
        taskData.subtasks = taskData.subtasks.map(subtask => ({
          ...subtask,
          task_id: id
        }));
      }
      
      mockTasks[index] = {
        ...mockTasks[index],
        ...taskData,
        updated_at: new Date().toISOString()
      };
      
      return { data: mockTasks[index], error: null };
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      return { data: null, error };
    }
  },
  
  deleteTask: async (id: string) => {
    try {
      const index = mockTasks.findIndex(t => t.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Task not found') };
      }
      
      mockTasks.splice(index, 1);
      
      return { data: { id }, error: null };
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      return { data: null, error };
    }
  },
  
  getProposals: async () => {
    try {
      return { data: mockProposals, error: null };
    } catch (error) {
      console.error("Error fetching proposals:", error);
      return { data: null, error };
    }
  },
  
  getProposal: async (id: string) => {
    try {
      const proposal = mockProposals.find(p => p.id === id);
      return { data: proposal || null, error: proposal ? null : new Error('Proposal not found') };
    } catch (error) {
      console.error(`Error fetching proposal ${id}:`, error);
      return { data: null, error };
    }
  },
  
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
      
      mockProposals.push(newProposal);
      
      if (newProposal.opportunity_id) {
        const opportunity = mockOpportunities.find(o => o.id === newProposal.opportunity_id);
        if (opportunity) {
          if (newProposal.status === 'draft' || newProposal.status === 'pending_approval') {
            crmService.updateOpportunity(opportunity.id, { status: 'preparing_proposal' });
          } else if (newProposal.status === 'sent') {
            crmService.updateOpportunity(opportunity.id, { status: 'proposal_sent' });
          }
        }
      }
      
      return { data: newProposal, error: null };
    } catch (error) {
      console.error("Error creating proposal:", error);
      return { data: null, error };
    }
  },
  
  updateProposal: async (id: string, proposalData: Partial<Proposal>) => {
    try {
      const index = mockProposals.findIndex(p => p.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Proposal not found') };
      }
      
      const prevStatus = mockProposals[index].status;
      
      mockProposals[index] = {
        ...mockProposals[index],
        ...proposalData,
        updated_at: new Date().toISOString()
      };
      
      const updatedProposal = mockProposals[index];
      
      if (prevStatus !== proposalData.status && proposalData.status && updatedProposal.opportunity_id) {
        const opportunityIndex = mockOpportunities.findIndex(o => o.id === updatedProposal.opportunity_id);
        if (opportunityIndex >= 0) {
          const opportunity = mockOpportunities[opportunityIndex];
          if (proposalData.status === 'sent') {
            crmService.updateOpportunity(opportunity.id, { status: 'proposal_sent' });
          } else if (proposalData.status === 'accepted') {
            crmService.updateOpportunity(opportunity.id, { status: 'accepted' });
          } else if (proposalData.status === 'rejected') {
            crmService.updateOpportunity(opportunity.id, { status: 'lost' });
          }
        }
      }
      
      return { data: updatedProposal, error: null };
    } catch (error) {
      console.error(`Error updating proposal ${id}:`, error);
      return { data: null, error };
    }
  },
  
  deleteProposal: async (id: string) => {
    try {
      const index = mockProposals.findIndex(p => p.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Proposal not found') };
      }
      
      mockProposals.splice(index, 1);
      
      return { data: { id }, error: null };
    } catch (error) {
      console.error(`Error deleting proposal ${id}:`, error);
      return { data: null, error };
    }
  }
};

export default crmService;
