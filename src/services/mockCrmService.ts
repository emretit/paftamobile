import { Opportunity, ContactHistoryItem } from "@/types/crm";
import { Task } from "@/types/task";

// Mock data - Opportunities
let mockOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    title: "Potansiyel Büyük Müşteri Anlaşması",
    status: "new",
    priority: "high",
    value: 50000,
    customer_id: "cust-1",
    employee_id: "emp-1",
    created_at: "2024-07-01T10:00:00Z",
    updated_at: "2024-07-01T10:00:00Z",
    expected_close_date: "2024-12-31T00:00:00Z",
    notes: "Görüşmeler olumlu ilerliyor. Teklif hazırlanacak.",
    contact_history: []
  },
  {
    id: "opp-2",
    title: "Web Sitesi Yenileme Projesi",
    status: "first_contact",
    priority: "medium",
    value: 20000,
    customer_id: "cust-2",
    employee_id: "emp-2",
    created_at: "2024-06-15T14:30:00Z",
    updated_at: "2024-06-15T14:30:00Z",
    expected_close_date: "2024-11-15T00:00:00Z",
    notes: "Müşteri ile ilk görüşme yapıldı. İhtiyaçlar belirlendi.",
    contact_history: []
  },
  {
    id: "opp-3",
    title: "Mobil Uygulama Geliştirme",
    status: "site_visit",
    priority: "low",
    value: 30000,
    customer_id: "cust-3",
    employee_id: "emp-1",
    created_at: "2024-05-20T09:00:00Z",
    updated_at: "2024-05-20T09:00:00Z",
    expected_close_date: "2024-10-30T00:00:00Z",
    notes: "Müşteri lokasyonunda ziyaret gerçekleştirildi. Teknik detaylar konuşuldu.",
    contact_history: []
  },
  {
    id: "opp-4",
    title: "ERP Sistemi Entegrasyonu",
    status: "preparing_proposal",
    priority: "high",
    value: 75000,
    customer_id: "cust-4",
    employee_id: "emp-2",
    created_at: "2024-04-10T16:45:00Z",
    updated_at: "2024-04-10T16:45:00Z",
    expected_close_date: "2024-09-20T00:00:00Z",
    notes: "Teklif hazırlanıyor. Müşteriye özel fiyatlandırma yapılacak.",
    contact_history: []
  },
  {
    id: "opp-5",
    title: "Bulut Sunucu Migrasyonu",
    status: "proposal_sent",
    priority: "medium",
    value: 15000,
    customer_id: "cust-5",
    employee_id: "emp-1",
    created_at: "2024-03-01T11:15:00Z",
    updated_at: "2024-03-01T11:15:00Z",
    expected_close_date: "2024-08-15T00:00:00Z",
    notes: "Teklif müşteriye gönderildi. Onay bekleniyor.",
    contact_history: []
  },
  {
    id: "opp-6",
    title: "Yazılım Lisanslama Anlaşması",
    status: "accepted",
    priority: "high",
    value: 100000,
    customer_id: "cust-6",
    employee_id: "emp-2",
    created_at: "2024-02-01T08:00:00Z",
    updated_at: "2024-02-01T08:00:00Z",
    expected_close_date: "2024-07-01T00:00:00Z",
    notes: "Anlaşma başarıyla tamamlandı.",
    contact_history: []
  },
  {
    id: "opp-7",
    title: "Donanım Tedarik Projesi",
    status: "lost",
    priority: "medium",
    value: 5000,
    customer_id: "cust-7",
    employee_id: "emp-1",
    created_at: "2024-01-15T13:00:00Z",
    updated_at: "2024-01-15T13:00:00Z",
    expected_close_date: "2024-06-30T00:00:00Z",
    notes: "Müşteri başka bir tedarikçi ile anlaştı.",
    contact_history: []
  }
];

// Mock data - Tasks
let mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Müşteri ile Teklif Görüşmesi",
    status: "todo",
    priority: "high",
    type: "meeting",
    due_date: "2024-07-05T17:00:00Z",
    assigned_to: "emp-1",
    related_item_id: "opp-1",
    related_item_title: "Potansiyel Büyük Müşteri Anlaşması",
    related_item_type: "opportunity",
    created_at: "2024-07-02T09:00:00Z",
    updated_at: "2024-07-02T09:00:00Z",
    assignee: {
      id: "emp-1",
      first_name: "Ayşe",
      last_name: "Yılmaz",
      avatar_url: "/avatars/1.png"
    }
  },
  {
    id: "task-2",
    title: "Web Sitesi İçerik Güncellemesi",
    status: "in_progress",
    priority: "medium",
    type: "general",
    due_date: "2024-07-10T12:00:00Z",
    assigned_to: "emp-2",
    related_item_id: "opp-2",
    related_item_title: "Web Sitesi Yenileme Projesi",
    related_item_type: "opportunity",
    created_at: "2024-06-16T11:00:00Z",
    updated_at: "2024-06-16T11:00:00Z",
    assignee: {
      id: "emp-2",
      first_name: "Mehmet",
      last_name: "Demir",
      avatar_url: "/avatars/2.png"
    }
  },
  {
    id: "task-3",
    title: "Mobil Uygulama Testlerinin Yapılması",
    status: "completed",
    priority: "low",
    type: "general",
    due_date: "2024-07-15T18:00:00Z",
    assigned_to: "emp-1",
    related_item_id: "opp-3",
    related_item_title: "Mobil Uygulama Geliştirme",
    related_item_type: "opportunity",
    created_at: "2024-05-21T15:00:00Z",
    updated_at: "2024-05-21T15:00:00Z",
    assignee: {
      id: "emp-1",
      first_name: "Ayşe",
      last_name: "Yılmaz",
      avatar_url: "/avatars/1.png"
    }
  },
  {
    id: "task-4",
    title: "ERP Sistemi Demo Sunumu",
    status: "postponed",
    priority: "high",
    type: "meeting",
    due_date: "2024-07-20T10:00:00Z",
    assigned_to: "emp-2",
    related_item_id: "opp-4",
    related_item_title: "ERP Sistemi Entegrasyonu",
    related_item_type: "opportunity",
    created_at: "2024-04-11T14:00:00Z",
    updated_at: "2024-04-11T14:00:00Z",
    assignee: {
      id: "emp-2",
      first_name: "Mehmet",
      last_name: "Demir",
      avatar_url: "/avatars/2.png"
    }
  },
  {
    id: "task-5",
    title: "Bulut Sunucu Güvenlik Kontrolleri",
    status: "todo",
    priority: "medium",
    type: "general",
    due_date: "2024-07-25T16:00:00Z",
    assigned_to: "emp-1",
    related_item_id: "opp-5",
    related_item_title: "Bulut Sunucu Migrasyonu",
    related_item_type: "opportunity",
    created_at: "2024-03-02T10:00:00Z",
    updated_at: "2024-03-02T10:00:00Z",
    assignee: {
      id: "emp-1",
      first_name: "Ayşe",
      last_name: "Yılmaz",
      avatar_url: "/avatars/1.png"
    }
  },
  {
    id: "task-6",
    title: "Yazılım Lisans Sözleşmesi İmzalanması",
    status: "completed",
    priority: "high",
    type: "general",
    due_date: "2024-07-30T11:00:00Z",
    assigned_to: "emp-2",
    related_item_id: "opp-6",
    related_item_title: "Yazılım Lisanslama Anlaşması",
    related_item_type: "opportunity",
    created_at: "2024-02-02T08:00:00Z",
    updated_at: "2024-02-02T08:00:00Z",
    assignee: {
      id: "emp-2",
      first_name: "Mehmet",
      last_name: "Demir",
      avatar_url: "/avatars/2.png"
    }
  },
  {
    id: "task-7",
    title: "Donanım İhale Şartnamesinin Hazırlanması",
    status: "todo",
    priority: "medium",
    type: "general",
    due_date: "2024-08-05T14:00:00Z",
    assigned_to: "emp-1",
    related_item_id: "opp-7",
    related_item_title: "Donanım Tedarik Projesi",
    related_item_type: "opportunity",
    created_at: "2024-01-16T13:00:00Z",
    updated_at: "2024-01-16T13:00:00Z",
    assignee: {
      id: "emp-1",
      first_name: "Ayşe",
      last_name: "Yılmaz",
      avatar_url: "/avatars/1.png"
    }
  }
];

// Mock API functions
const getOpportunities = async (): Promise<{ data: Opportunity[] | null, error: any }> => {
  return { data: mockOpportunities, error: null };
};

const getOpportunityById = async (id: string): Promise<{ data: Opportunity | null, error: any }> => {
  const opportunity = mockOpportunities.find(opp => opp.id === id);
  return { data: opportunity || null, error: null };
};

const createOpportunity = async (opportunity: Opportunity): Promise<{ data: Opportunity | null, error: any }> => {
  mockOpportunities.push(opportunity);
  return { data: opportunity, error: null };
};

const updateOpportunity = async (id: string, updates: Partial<Opportunity>): Promise<{ data: Opportunity | null, error: any }> => {
  const index = mockOpportunities.findIndex(opp => opp.id === id);
  if (index !== -1) {
    mockOpportunities[index] = { ...mockOpportunities[index], ...updates } as Opportunity;
    return { data: mockOpportunities[index], error: null };
  }
  return { data: null, error: 'Opportunity not found' };
};

const deleteOpportunity = async (id: string): Promise<{ success: boolean, error: any }> => {
  mockOpportunities = mockOpportunities.filter(opp => opp.id !== id);
  return { success: true, error: null };
};

const addContactHistory = async (opportunityId: string, contactHistory: ContactHistoryItem): Promise<{ data: ContactHistoryItem | null, error: any }> => {
  const opportunity = mockOpportunities.find(opp => opp.id === opportunityId);
  if (opportunity && opportunity.contact_history) {
    opportunity.contact_history.push(contactHistory);
    return { data: contactHistory, error: null };
  }
  return { data: null, error: 'Opportunity not found' };
};

const getOpportunityContactHistory = async (opportunityId: string): Promise<{ data: ContactHistoryItem[] | null, error: any }> => {
  const opportunity = mockOpportunities.find(opp => opp.id === opportunityId);
  if (opportunity) {
    return { data: opportunity.contact_history || [], error: null };
  }
  return { data: null, error: 'Opportunity not found' };
};

const getTasks = async (): Promise<{ data: Task[] | null, error: any }> => {
  return { data: mockTasks, error: null };
};

const updateTask = async (id: string, updates: Partial<Task>): Promise<{ data: Task | null, error: any }> => {
  const index = mockTasks.findIndex(task => task.id === id);
  if (index !== -1) {
    mockTasks[index] = { ...mockTasks[index], ...updates } as Task;
    return { data: mockTasks[index], error: null };
  }
  return { data: null, error: 'Task not found' };
};

const deleteTask = async (id: string): Promise<{ success: boolean, error: any }> => {
  mockTasks = mockTasks.filter(task => task.id !== id);
  return { success: true, error: null };
};

// Mock API for tasks (mimicking a separate tasks API)
const mockTasksAPI = {
  createTask: async (task: Omit<Task, 'id'>): Promise<{ data: Task | null, error: any }> => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Task;
    mockTasks.push(newTask);
    return { data: newTask, error: null };
  },
  
  updateTask: async (id: string, updates: Partial<Task>): Promise<{ data: Task | null, error: any }> => {
    const index = mockTasks.findIndex(task => task.id === id);
    if (index !== -1) {
      mockTasks[index] = { ...mockTasks[index], ...updates } as Task;
      return { data: mockTasks[index], error: null };
    }
    return { data: null, error: 'Task not found' };
  },
  
  deleteTask: async (id: string): Promise<{ success: boolean, error: any }> => {
    mockTasks = mockTasks.filter(task => task.id !== id);
    return { success: true, error: null };
  },
};

// Export as a named export for components expecting 'mockCrmService'
export const mockCrmService = {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityById,
  addContactHistory,
  getOpportunityContactHistory,
  getTasks,
  mockTasksAPI,
  updateTask,
  deleteTask
};
