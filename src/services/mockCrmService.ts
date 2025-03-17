
import { v4 as uuidv4 } from 'uuid';
import { Opportunity, OpportunityStatus } from '@/types/crm';
import { Task, TaskStatus, TaskPriority, TaskType, SubTask } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';

// Sample data for opportunities
const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'ERP Sistem Entegrasyonu',
    description: 'ABC Firması için ERP entegrasyonu projesi',
    status: 'new',
    priority: 'high',
    value: 250000,
    customer_id: '1',
    employee_id: '1',
    created_at: '2023-12-01T10:00:00Z',
    updated_at: '2023-12-01T10:00:00Z',
    expected_close_date: '2024-02-15T00:00:00Z',
    notes: 'İlk görüşme sonrası teknik detaylar konuşulacak.',
    contact_history: [
      {
        id: '101',
        date: '2023-12-01T10:00:00Z',
        contact_type: 'call',
        notes: 'İlk telefon görüşmesi yapıldı, randevu alındı.',
        employee_id: '1',
        employee_name: 'Ahmet Yılmaz'
      }
    ],
    customer: {
      id: '1',
      name: 'ABC Holding',
      company: 'ABC Holding A.Ş.',
      email: 'info@abcholding.com',
      phone: '5321234567'
    },
    employee: {
      id: '1',
      first_name: 'Ahmet',
      last_name: 'Yılmaz',
      email: 'ahmet@example.com',
      avatar_url: '/assets/avatars/avatar-1.png'
    }
  },
  {
    id: '2',
    title: 'Veri Merkezi Yenileme',
    description: 'XYZ Bankası veri merkezi yenileme projesi',
    status: 'first_contact',
    priority: 'medium',
    value: 500000,
    customer_id: '2',
    employee_id: '2',
    created_at: '2023-11-15T09:30:00Z',
    updated_at: '2023-11-20T14:00:00Z',
    expected_close_date: '2024-03-30T00:00:00Z',
    notes: 'İkinci görüşme için teknik ekibin katılımı gerekiyor.',
    contact_history: [
      {
        id: '201',
        date: '2023-11-15T09:30:00Z',
        contact_type: 'meeting',
        notes: 'İlk tanışma toplantısı yapıldı.',
        employee_id: '2',
        employee_name: 'Zeynep Kaya'
      },
      {
        id: '202',
        date: '2023-11-20T14:00:00Z',
        contact_type: 'email',
        notes: 'Bilgi broşürleri gönderildi.',
        employee_id: '2',
        employee_name: 'Zeynep Kaya'
      }
    ],
    customer: {
      id: '2',
      name: 'XYZ Bankası',
      company: 'XYZ Bankası A.Ş.',
      email: 'contact@xyzbank.com',
      phone: '5327654321'
    },
    employee: {
      id: '2',
      first_name: 'Zeynep',
      last_name: 'Kaya',
      email: 'zeynep@example.com',
      avatar_url: '/assets/avatars/avatar-2.png'
    }
  },
  {
    id: '3',
    title: 'Bulut Altyapı Hizmetleri',
    description: 'DEF Lojistik için bulut altyapı hizmetleri',
    status: 'site_visit',
    priority: 'medium',
    value: 150000,
    customer_id: '3',
    employee_id: '3',
    created_at: '2023-10-20T11:15:00Z',
    updated_at: '2023-11-25T16:30:00Z',
    expected_close_date: '2024-01-20T00:00:00Z',
    notes: 'Müşteri ofisinde teknik altyapı incelemesi yapıldı.',
    contact_history: [
      {
        id: '301',
        date: '2023-10-20T11:15:00Z',
        contact_type: 'call',
        notes: 'İlk telefon görüşmesi.',
        employee_id: '3',
        employee_name: 'Mehmet Demir'
      },
      {
        id: '302',
        date: '2023-11-05T13:00:00Z',
        contact_type: 'meeting',
        notes: 'Genel tanıtım sunumu yapıldı.',
        employee_id: '3',
        employee_name: 'Mehmet Demir'
      },
      {
        id: '303',
        date: '2023-11-25T16:30:00Z',
        contact_type: 'meeting',
        notes: 'Teknik inceleme için müşteri ziyaret edildi.',
        employee_id: '3',
        employee_name: 'Mehmet Demir'
      }
    ],
    customer: {
      id: '3',
      name: 'DEF Lojistik',
      company: 'DEF Lojistik Ltd.',
      email: 'info@deflojistik.com',
      phone: '5325678901'
    },
    employee: {
      id: '3',
      first_name: 'Mehmet',
      last_name: 'Demir',
      email: 'mehmet@example.com',
      avatar_url: '/assets/avatars/avatar-3.png'
    }
  },
  {
    id: '4',
    title: 'Siber Güvenlik Analizi',
    description: 'GHI Sigorta için kapsamlı siber güvenlik analizi',
    status: 'preparing_proposal',
    priority: 'high',
    value: 120000,
    customer_id: '4',
    employee_id: '4',
    created_at: '2023-11-10T09:00:00Z',
    updated_at: '2023-12-05T11:45:00Z',
    expected_close_date: '2024-01-15T00:00:00Z',
    notes: 'Güvenlik açıkları tespit edildi, detaylı rapor hazırlanıyor.',
    contact_history: [
      {
        id: '401',
        date: '2023-11-10T09:00:00Z',
        contact_type: 'email',
        notes: 'Müşteriden gelen talep emaili.',
        employee_id: '4',
        employee_name: 'Ayşe Can'
      },
      {
        id: '402',
        date: '2023-11-15T10:30:00Z',
        contact_type: 'call',
        notes: 'Telefon görüşmesi ile detaylar alındı.',
        employee_id: '4',
        employee_name: 'Ayşe Can'
      },
      {
        id: '403',
        date: '2023-11-25T14:00:00Z',
        contact_type: 'meeting',
        notes: 'Yerinde inceleme yapıldı.',
        employee_id: '4',
        employee_name: 'Ayşe Can'
      },
      {
        id: '404',
        date: '2023-12-05T11:45:00Z',
        contact_type: 'email',
        notes: 'Ön değerlendirme raporu gönderildi.',
        employee_id: '4',
        employee_name: 'Ayşe Can'
      }
    ],
    customer: {
      id: '4',
      name: 'GHI Sigorta',
      company: 'GHI Sigorta A.Ş.',
      email: 'info@ghisigorta.com',
      phone: '5327890123'
    },
    employee: {
      id: '4',
      first_name: 'Ayşe',
      last_name: 'Can',
      email: 'ayse@example.com',
      avatar_url: '/assets/avatars/avatar-4.png'
    }
  },
  {
    id: '5',
    title: 'Yazılım Lisans Yenileme',
    description: 'JKL Medya için yazılım lisanslarının yenilenmesi',
    status: 'proposal_sent',
    priority: 'low',
    value: 50000,
    customer_id: '5',
    employee_id: '5',
    created_at: '2023-12-01T08:30:00Z',
    updated_at: '2023-12-10T15:20:00Z',
    expected_close_date: '2024-01-05T00:00:00Z',
    notes: 'Teklif gönderildi, müşteri değerlendirmesini bekliyor.',
    contact_history: [
      {
        id: '501',
        date: '2023-12-01T08:30:00Z',
        contact_type: 'call',
        notes: 'Yenileme hatırlatması için arandı.',
        employee_id: '5',
        employee_name: 'Ali Yıldız'
      },
      {
        id: '502',
        date: '2023-12-05T13:15:00Z',
        contact_type: 'email',
        notes: 'Lisans opsiyonları gönderildi.',
        employee_id: '5',
        employee_name: 'Ali Yıldız'
      },
      {
        id: '503',
        date: '2023-12-10T15:20:00Z',
        contact_type: 'email',
        notes: 'Fiyat teklifi gönderildi.',
        employee_id: '5',
        employee_name: 'Ali Yıldız'
      }
    ],
    customer: {
      id: '5',
      name: 'JKL Medya',
      company: 'JKL Medya Grubu',
      email: 'info@jklmedya.com',
      phone: '5329012345'
    },
    employee: {
      id: '5',
      first_name: 'Ali',
      last_name: 'Yıldız',
      email: 'ali@example.com',
      avatar_url: '/assets/avatars/avatar-5.png'
    }
  },
  {
    id: '6',
    title: 'Donanım Tedariki',
    description: 'MNO Eğitim kurumu için 100 adet dizüstü bilgisayar tedariki',
    status: 'accepted',
    priority: 'high',
    value: 300000,
    customer_id: '6',
    employee_id: '1',
    created_at: '2023-10-15T09:45:00Z',
    updated_at: '2023-12-15T14:00:00Z',
    expected_close_date: '2023-12-30T00:00:00Z',
    notes: 'Teklif kabul edildi, tedarik süreci başlatıldı.',
    contact_history: [
      {
        id: '601',
        date: '2023-10-15T09:45:00Z',
        contact_type: 'email',
        notes: 'İlk talep alındı.',
        employee_id: '1',
        employee_name: 'Ahmet Yılmaz'
      },
      {
        id: '602',
        date: '2023-10-25T11:30:00Z',
        contact_type: 'meeting',
        notes: 'Gereksinimler detaylandırıldı.',
        employee_id: '1',
        employee_name: 'Ahmet Yılmaz'
      },
      {
        id: '603',
        date: '2023-11-10T10:00:00Z',
        contact_type: 'email',
        notes: 'Farklı model opsiyonları sunuldu.',
        employee_id: '1',
        employee_name: 'Ahmet Yılmaz'
      },
      {
        id: '604',
        date: '2023-11-25T14:30:00Z',
        contact_type: 'email',
        notes: 'Teklif gönderildi.',
        employee_id: '1',
        employee_name: 'Ahmet Yılmaz'
      },
      {
        id: '605',
        date: '2023-12-15T14:00:00Z',
        contact_type: 'call',
        notes: 'Müşteri teklifi kabul etti.',
        employee_id: '1',
        employee_name: 'Ahmet Yılmaz'
      }
    ],
    customer: {
      id: '6',
      name: 'MNO Eğitim',
      company: 'MNO Eğitim Kurumları',
      email: 'info@mnoedu.com',
      phone: '5321234567'
    },
    employee: {
      id: '1',
      first_name: 'Ahmet',
      last_name: 'Yılmaz',
      email: 'ahmet@example.com',
      avatar_url: '/assets/avatars/avatar-1.png'
    }
  },
  {
    id: '7',
    title: 'Ağ Altyapı Yenileme',
    description: 'PQR Fabrikası ağ altyapısı yenileme projesi',
    status: 'lost',
    priority: 'medium',
    value: 180000,
    customer_id: '7',
    employee_id: '2',
    created_at: '2023-09-01T10:00:00Z',
    updated_at: '2023-11-15T09:30:00Z',
    expected_close_date: '2023-12-01T00:00:00Z',
    notes: 'Teklif reddedildi, fiyat beklentileri karşılanamadı.',
    contact_history: [
      {
        id: '701',
        date: '2023-09-01T10:00:00Z',
        contact_type: 'call',
        notes: 'Müşteri tarafından arandık.',
        employee_id: '2',
        employee_name: 'Zeynep Kaya'
      },
      {
        id: '702',
        date: '2023-09-15T13:45:00Z',
        contact_type: 'meeting',
        notes: 'Yerinde inceleme yapıldı.',
        employee_id: '2',
        employee_name: 'Zeynep Kaya'
      },
      {
        id: '703',
        date: '2023-10-05T15:00:00Z',
        contact_type: 'email',
        notes: 'Detaylı teklif gönderildi.',
        employee_id: '2',
        employee_name: 'Zeynep Kaya'
      },
      {
        id: '704',
        date: '2023-11-15T09:30:00Z',
        contact_type: 'call',
        notes: 'Müşteri rakip firmadan daha uygun teklif aldığını belirtti.',
        employee_id: '2',
        employee_name: 'Zeynep Kaya'
      }
    ],
    customer: {
      id: '7',
      name: 'PQR Fabrikası',
      company: 'PQR Endüstri A.Ş.',
      email: 'info@pqr.com',
      phone: '5326789012'
    },
    employee: {
      id: '2',
      first_name: 'Zeynep',
      last_name: 'Kaya',
      email: 'zeynep@example.com',
      avatar_url: '/assets/avatars/avatar-2.png'
    }
  }
];

// Sample data for tasks related to opportunities
const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'ABC Holding ile ilk toplantı',
    description: 'ERP Sistem Entegrasyonu projesi için ilk toplantı',
    status: 'todo',
    priority: 'high',
    type: 'meeting',
    assignee_id: '1',
    due_date: '2024-01-10T10:00:00Z',
    created_at: '2023-12-01T10:00:00Z',
    updated_at: '2023-12-01T10:00:00Z',
    related_item_id: '1',
    related_item_title: 'ERP Sistem Entegrasyonu',
    subtasks: [
      {
        id: '101',
        title: 'Sunum dosyalarını hazırla',
        completed: true
      },
      {
        id: '102',
        title: 'Teknik ekibi bilgilendir',
        completed: false
      }
    ],
    assignee: {
      id: '1',
      first_name: 'Ahmet',
      last_name: 'Yılmaz',
      email: 'ahmet@example.com',
      avatar_url: '/assets/avatars/avatar-1.png'
    }
  },
  {
    id: '2',
    title: 'XYZ Bankası teklif hazırlığı',
    description: 'Veri Merkezi Yenileme projesi teklifi için gerekli dokümanları hazırla',
    status: 'in_progress',
    priority: 'medium',
    type: 'proposal',
    assignee_id: '2',
    due_date: '2024-01-15T17:00:00Z',
    created_at: '2023-11-25T09:00:00Z',
    updated_at: '2023-11-30T14:00:00Z',
    related_item_id: '2',
    related_item_title: 'Veri Merkezi Yenileme',
    assignee: {
      id: '2',
      first_name: 'Zeynep',
      last_name: 'Kaya',
      email: 'zeynep@example.com',
      avatar_url: '/assets/avatars/avatar-2.png'
    }
  },
  {
    id: '3',
    title: 'DEF Lojistik keşif raporu hazırla',
    description: 'Bulut Altyapı Hizmetleri projesi için keşif raporunu tamamla',
    status: 'completed',
    priority: 'medium',
    type: 'general',
    assignee_id: '3',
    due_date: '2023-12-05T16:00:00Z',
    created_at: '2023-11-25T11:00:00Z',
    updated_at: '2023-12-05T15:30:00Z',
    related_item_id: '3',
    related_item_title: 'Bulut Altyapı Hizmetleri',
    assignee: {
      id: '3',
      first_name: 'Mehmet',
      last_name: 'Demir',
      email: 'mehmet@example.com',
      avatar_url: '/assets/avatars/avatar-3.png'
    }
  }
];

// Mock API service for CRM functionality
export const mockOpportunitiesAPI = {
  // Get all opportunities
  getOpportunities: async () => {
    try {
      // Check if we should store the sample data in Supabase
      const { count, error: countError } = await supabase
        .from('opportunities')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;

      // If no data in Supabase, populate with sample data
      if (count === 0) {
        // Insert sample opportunities
        const { error: insertError } = await supabase
          .from('opportunities')
          .insert(SAMPLE_OPPORTUNITIES);
          
        if (insertError) throw insertError;
      }
      
      // Fetch opportunities from Supabase
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return { data: SAMPLE_OPPORTUNITIES, error: null };
    }
  },
  
  // Get opportunity by ID
  getOpportunityById: async (id: string) => {
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
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching opportunity with ID ${id}:`, error);
      const opportunity = SAMPLE_OPPORTUNITIES.find(o => o.id === id);
      return { data: opportunity, error: opportunity ? null : new Error('Opportunity not found') };
    }
  },
  
  // Create a new opportunity
  createOpportunity: async (opportunityData: Partial<Opportunity>) => {
    try {
      const newOpportunity = {
        id: uuidv4(),
        ...opportunityData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('opportunities')
        .insert(newOpportunity)
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating opportunity:', error);
      const newOpportunity = {
        id: uuidv4(),
        ...opportunityData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer: opportunityData.customer_id 
          ? SAMPLE_OPPORTUNITIES.find(o => o.customer?.id === opportunityData.customer_id)?.customer 
          : undefined,
        employee: opportunityData.employee_id 
          ? SAMPLE_OPPORTUNITIES.find(o => o.employee?.id === opportunityData.employee_id)?.employee 
          : undefined
      };
      return { data: newOpportunity, error: null };
    }
  },
  
  // Update an existing opportunity
  updateOpportunity: async (id: string, updates: Partial<Opportunity>) => {
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const updatedOpportunity = {
        ...existingData,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('opportunities')
        .update(updatedOpportunity)
        .eq('id', id)
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error updating opportunity with ID ${id}:`, error);
      // Fallback to mock data if database operation fails
      const opportunityIndex = SAMPLE_OPPORTUNITIES.findIndex(o => o.id === id);
      if (opportunityIndex === -1) {
        return { data: null, error: new Error('Opportunity not found') };
      }
      
      const updatedOpportunity = {
        ...SAMPLE_OPPORTUNITIES[opportunityIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      SAMPLE_OPPORTUNITIES[opportunityIndex] = updatedOpportunity;
      return { data: updatedOpportunity, error: null };
    }
  },
  
  // Delete an opportunity
  deleteOpportunity: async (id: string) => {
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Error deleting opportunity with ID ${id}:`, error);
      return { success: false, error };
    }
  },
  
  // Filter opportunities
  filterOpportunities: async (
    searchTerm: string = '',
    employeeId?: string,
    customerId?: string
  ) => {
    try {
      let query = supabase
        .from('opportunities')
        .select(`
          *,
          customer:customer_id(*),
          employee:employee_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error filtering opportunities:', error);
      // Fallback to local filtering if database operation fails
      let filteredOpportunities = [...SAMPLE_OPPORTUNITIES];
      
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredOpportunities = filteredOpportunities.filter(
          opportunity => 
            opportunity.title.toLowerCase().includes(lowerSearchTerm) ||
            (opportunity.description?.toLowerCase().includes(lowerSearchTerm) || false)
        );
      }
      
      if (employeeId) {
        filteredOpportunities = filteredOpportunities.filter(
          opportunity => opportunity.employee_id === employeeId
        );
      }
      
      if (customerId) {
        filteredOpportunities = filteredOpportunities.filter(
          opportunity => opportunity.customer_id === customerId
        );
      }
      
      return { data: filteredOpportunities, error: null };
    }
  },
  
  // Get all tasks
  getTasks: async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(*)
        `)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { data: SAMPLE_TASKS, error: null };
    }
  },
  
  // Get tasks for a specific opportunity
  getTasksForOpportunity: async (opportunityId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(*)
        `)
        .eq('related_item_id', opportunityId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching tasks for opportunity with ID ${opportunityId}:`, error);
      const tasks = SAMPLE_TASKS.filter(task => task.related_item_id === opportunityId);
      return { data: tasks, error: null };
    }
  },
  
  // Create a new task
  createTask: async (taskData: Partial<Task>) => {
    try {
      const newTask = {
        id: uuidv4(),
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select(`
          *,
          assignee:assignee_id(*)
        `)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error creating task:', error);
      // Fallback to mock data if database operation fails
      const newTask = {
        id: uuidv4(),
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignee: taskData.assignee_id
          ? SAMPLE_TASKS.find(t => t.assignee?.id === taskData.assignee_id)?.assignee
          : undefined
      };
      SAMPLE_TASKS.push(newTask as Task);
      return { data: newTask, error: null };
    }
  },
  
  // Update opportunity based on proposal status
  updateOpportunityBasedOnProposal: async (
    proposalId: string,
    proposalStatus: string,
    opportunityId: string
  ) => {
    try {
      let opportunityStatus: OpportunityStatus;
      
      // Map proposal status to opportunity status
      switch (proposalStatus) {
        case 'draft':
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
        case 'expired':
          opportunityStatus = 'lost';
          break;
        default:
          opportunityStatus = 'proposal_sent';
      }
      
      // Update opportunity status
      const { data, error } = await this.updateOpportunity(opportunityId, {
        status: opportunityStatus,
        updated_at: new Date().toISOString()
      });
      
      if (error) throw error;
      
      return { data, success: true };
    } catch (error) {
      console.error('Error updating opportunity based on proposal:', error);
      return { success: false, error };
    }
  },
};

export default mockOpportunitiesAPI;
