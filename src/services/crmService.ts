import { supabase } from "@/integrations/supabase/client";
import { 
  Opportunity, 
  OpportunityStatus, 
  OpportunityPriority, 
  ContactHistoryEntry 
} from "@/types/crm";
import { 
  Task, 
  TaskStatus, 
  TaskPriority, 
  TaskType, 
  SubTask 
} from "@/types/task";
import { 
  Proposal, 
  ProposalStatus, 
  ProposalItem 
} from "@/types/proposal";
import { toast } from "sonner";

// ============ OPPORTUNITIES ============
export const getOpportunities = async (): Promise<Opportunity[]> => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        customer:customers(id, name, company, email, mobile_phone),
        employee:employees(id, first_name, last_name, email, avatar_url)
      `);

    if (error) throw error;

    // Parse contact_history JSON from string to object
    return data.map(opp => ({
      ...opp,
      contact_history: opp.contact_history ? opp.contact_history : []
    }));
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    toast.error('Fırsatlar yüklenirken bir hata oluştu');
    return [];
  }
};

export const getOpportunity = async (id: string): Promise<Opportunity | null> => {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        customer:customers(id, name, company, email, mobile_phone),
        employee:employees(id, first_name, last_name, email, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      contact_history: data.contact_history ? data.contact_history : []
    };
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    toast.error('Fırsat detayları yüklenirken bir hata oluştu');
    return null;
  }
};

export const createOpportunity = async (opportunity: Partial<Opportunity>): Promise<Opportunity | null> => {
  try {
    // Ensure contact_history is in the right format
    const formattedOpportunity = {
      ...opportunity,
      contact_history: opportunity.contact_history ? JSON.stringify(opportunity.contact_history) : '[]'
    };

    const { data, error } = await supabase
      .from('opportunities')
      .insert(formattedOpportunity)
      .select()
      .single();

    if (error) throw error;

    toast.success('Fırsat başarıyla oluşturuldu');
    return {
      ...data,
      contact_history: data.contact_history ? data.contact_history : []
    };
  } catch (error) {
    console.error('Error creating opportunity:', error);
    toast.error('Fırsat oluşturulurken bir hata oluştu');
    return null;
  }
};

export const updateOpportunity = async (id: string, updates: Partial<Opportunity>): Promise<Opportunity | null> => {
  try {
    // Handle contact_history JSON conversion if it exists
    const formattedUpdates = { ...updates };
    if (formattedUpdates.contact_history) {
      formattedUpdates.contact_history = JSON.stringify(formattedUpdates.contact_history);
    }

    const { data, error } = await supabase
      .from('opportunities')
      .update(formattedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast.success('Fırsat başarıyla güncellendi');
    return {
      ...data,
      contact_history: data.contact_history ? data.contact_history : []
    };
  } catch (error) {
    console.error('Error updating opportunity:', error);
    toast.error('Fırsat güncellenirken bir hata oluştu');
    return null;
  }
};

export const deleteOpportunity = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success('Fırsat başarıyla silindi');
    return true;
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    toast.error('Fırsat silinirken bir hata oluştu');
    return false;
  }
};

// ============ TASKS ============
export const getTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:employees(id, first_name, last_name, email, avatar_url)
      `);

    if (error) throw error;

    // Parse subtasks JSON from string to object
    return data.map(task => ({
      ...task,
      subtasks: task.subtasks ? task.subtasks : []
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    toast.error('Görevler yüklenirken bir hata oluştu');
    return [];
  }
};

export const getTask = async (id: string): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:employees(id, first_name, last_name, email, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      subtasks: data.subtasks ? data.subtasks : []
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    toast.error('Görev detayları yüklenirken bir hata oluştu');
    return null;
  }
};

export const createTask = async (task: Partial<Task>): Promise<Task | null> => {
  try {
    // Ensure subtasks is in the right format
    const formattedTask = {
      ...task,
      subtasks: task.subtasks ? JSON.stringify(task.subtasks) : '[]'
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(formattedTask)
      .select()
      .single();

    if (error) throw error;

    toast.success('Görev başarıyla oluşturuldu');
    return {
      ...data,
      subtasks: data.subtasks ? data.subtasks : []
    };
  } catch (error) {
    console.error('Error creating task:', error);
    toast.error('Görev oluşturulurken bir hata oluştu');
    return null;
  }
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
  try {
    // Handle subtasks JSON conversion if it exists
    const formattedUpdates = { ...updates };
    if (formattedUpdates.subtasks) {
      formattedUpdates.subtasks = JSON.stringify(formattedUpdates.subtasks);
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(formattedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    toast.success('Görev başarıyla güncellendi');
    return {
      ...data,
      subtasks: data.subtasks ? data.subtasks : []
    };
  } catch (error) {
    console.error('Error updating task:', error);
    toast.error('Görev güncellenirken bir hata oluştu');
    return null;
  }
};

export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success('Görev başarıyla silindi');
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    toast.error('Görev silinirken bir hata oluştu');
    return false;
  }
};

// ============ PROPOSALS ============
export const getProposals = async (): Promise<Proposal[]> => {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        customer:customers(id, name, company, email, mobile_phone),
        employee:employees(id, first_name, last_name, email)
      `);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching proposals:', error);
    toast.error('Teklifler yüklenirken bir hata oluştu');
    return [];
  }
};

export const getProposal = async (id: string): Promise<Proposal | null> => {
  try {
    // Fetch proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select(`
        *,
        customer:customers(id, name, company, email, mobile_phone),
        employee:employees(id, first_name, last_name, email)
      `)
      .eq('id', id)
      .single();

    if (proposalError) throw proposalError;

    // Fetch proposal items
    const { data: items, error: itemsError } = await supabase
      .from('proposal_items')
      .select('*')
      .eq('proposal_id', id);

    if (itemsError) throw itemsError;

    // Combine proposal with items
    return {
      ...proposal,
      items: items
    };
  } catch (error) {
    console.error('Error fetching proposal:', error);
    toast.error('Teklif detayları yüklenirken bir hata oluştu');
    return null;
  }
};

export const createProposal = async (
  proposal: Partial<Proposal>, 
  items: Partial<ProposalItem>[] = []
): Promise<Proposal | null> => {
  try {
    // Start transaction
    const { data, error } = await supabase
      .from('proposals')
      .insert(proposal)
      .select()
      .single();

    if (error) throw error;

    // If there are items, add them
    if (items.length > 0) {
      const proposalItems = items.map(item => ({
        ...item,
        proposal_id: data.id
      }));

      const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(proposalItems);

      if (itemsError) throw itemsError;
    }

    toast.success('Teklif başarıyla oluşturuldu');
    return data;
  } catch (error) {
    console.error('Error creating proposal:', error);
    toast.error('Teklif oluşturulurken bir hata oluştu');
    return null;
  }
};

export const updateProposal = async (
  id: string, 
  updates: Partial<Proposal>,
  items?: Partial<ProposalItem>[]
): Promise<Proposal | null> => {
  try {
    // Update proposal
    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If items are provided, update them
    if (items) {
      // First delete existing items
      const { error: deleteError } = await supabase
        .from('proposal_items')
        .delete()
        .eq('proposal_id', id);

      if (deleteError) throw deleteError;

      // Then insert the new items
      if (items.length > 0) {
        const proposalItems = items.map(item => ({
          ...item,
          proposal_id: id
        }));

        const { error: itemsError } = await supabase
          .from('proposal_items')
          .insert(proposalItems);

        if (itemsError) throw itemsError;
      }
    }

    toast.success('Teklif başarıyla güncellendi');
    return data;
  } catch (error) {
    console.error('Error updating proposal:', error);
    toast.error('Teklif güncellenirken bir hata oluştu');
    return null;
  }
};

export const deleteProposal = async (id: string): Promise<boolean> => {
  try {
    // Proposal items will be deleted automatically due to ON DELETE CASCADE
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast.success('Teklif başarıyla silindi');
    return true;
  } catch (error) {
    console.error('Error deleting proposal:', error);
    toast.error('Teklif silinirken bir hata oluştu');
    return false;
  }
};

// CRM workflow functions
export const createTaskForOpportunity = async (
  opportunityId: string,
  opportunityTitle: string,
  taskTitle: string,
  description: string = "",
  status: TaskStatus = "todo",
  priority: TaskPriority = "medium",
  dueDate?: Date
): Promise<Task | null> => {
  try {
    // Create new task data
    const taskData = {
      title: taskTitle,
      description,
      status,
      priority,
      type: "opportunity" as TaskType,
      due_date: dueDate ? dueDate.toISOString() : undefined,
      related_item_id: opportunityId,
      related_item_title: opportunityTitle
    };

    // Use the createTask function to create the task
    return await createTask(taskData);
  } catch (error) {
    console.error("Error creating task for opportunity:", error);
    toast.error("Fırsat için görev oluşturulamadı");
    return null;
  }
};

export const updateOpportunityBasedOnProposal = async (
  proposalId: string,
  proposalStatus: ProposalStatus,
  opportunityId: string
): Promise<boolean> => {
  try {
    let opportunityStatus: OpportunityStatus | undefined;

    // Map proposal status to opportunity status
    switch (proposalStatus) {
      case 'draft':
        opportunityStatus = 'preparing_proposal';
        break;
      case 'pending_approval':
        opportunityStatus = 'preparing_proposal';
        break;
      case 'sent':
        opportunityStatus = 'proposal_sent';
        break;
      case 'accepted':
        opportunityStatus = 'accepted';
        break;
      case 'rejected':
        // Don't automatically change to lost, just keep as is
        return true;
      case 'expired':
        // Don't automatically change to lost, just keep as is
        return true;
    }

    // If status mapping exists, update the opportunity
    if (opportunityStatus) {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: opportunityStatus })
        .eq('id', opportunityId);

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error("Error updating opportunity based on proposal:", error);
    return false;
  }
};

// Export combined service
const crmService = {
  // Opportunities
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,

  // Tasks
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,

  // Proposals
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal,

  // Workflow
  createTaskForOpportunity,
  updateOpportunityBasedOnProposal
};

export default crmService;
