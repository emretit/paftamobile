
import { formatDateOffset } from './utils';
import { TaskStatus, TaskPriority, TaskType, Task } from '@/types/task';
import { mockTasksAPI } from '@/services/mockCrmService';

/**
 * Create task based on opportunity status change
 */
export const createTaskForOpportunity = async (
  opportunityId: string,
  opportunityTitle: string,
  status: string,
  employeeId?: string
) => {
  let task: Partial<Task> & { 
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    type: TaskType;
    created_at: string;
    updated_at: string;
  } = {
    related_item_id: opportunityId,
    related_item_title: opportunityTitle,
    related_item_type: 'opportunity',
    assigned_to: employeeId,
    status: 'todo' as TaskStatus,
    type: 'general' as TaskType,
    priority: 'medium' as TaskPriority,
    title: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Create different tasks based on opportunity status
  switch (status) {
    case 'new':
      task = {
        ...task,
        title: "İlk görüşmeyi yap ve ziyaret planla",
        description: `${opportunityTitle} için ilk görüşme ve müşteri ziyareti planla`,
        priority: 'medium' as TaskPriority,
        type: 'meeting' as TaskType,
        due_date: formatDateOffset(3)
      };
      break;
      
    case 'first_contact':
      task = {
        ...task,
        title: "Ziyaret yap ve raporla",
        description: `${opportunityTitle} için müşteri ziyareti yap ve raporla`,
        priority: 'medium' as TaskPriority,
        type: 'meeting' as TaskType,
        due_date: formatDateOffset(5)
      };
      break;
      
    case 'site_visit':
      task = {
        ...task,
        title: "Teklif hazırla",
        description: `${opportunityTitle} için teklif hazırla`,
        priority: 'high' as TaskPriority,
        type: 'proposal' as TaskType,
        due_date: formatDateOffset(2)
      };
      break;
      
    case 'proposal_sent':
      task = {
        ...task,
        title: "Teklif takibini yap",
        description: `${opportunityTitle} için gönderilen teklifin takibini yap`,
        priority: 'high' as TaskPriority,
        type: 'follow_up' as TaskType,
        due_date: formatDateOffset(3)
      };
      break;
      
    case 'accepted':
      task = {
        ...task,
        title: "Satış sözleşmesi hazırla",
        description: `${opportunityTitle} için satış sözleşmesi hazırla`,
        priority: 'high' as TaskPriority,
        type: 'opportunity' as TaskType,
        due_date: formatDateOffset(2)
      };
      break;
      
    case 'lost':
      task = {
        ...task,
        title: "Fırsatı kapat ve kaybetme nedeni raporla",
        description: `${opportunityTitle} fırsatının kaybedilme nedenlerini analiz et`,
        priority: 'medium' as TaskPriority,
        type: 'opportunity' as TaskType,
        due_date: formatDateOffset(1)
      };
      break;
      
    default:
      return null;
  }
  
  try {
    const result = await mockTasksAPI.createTask(task);
    return result.data;
  } catch (error) {
    console.error(`Error creating task for opportunity status ${status}:`, error);
    return null;
  }
};
