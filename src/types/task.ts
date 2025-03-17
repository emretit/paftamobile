
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'postponed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'general' | 'meeting' | 'follow_up' | 'call' | 'email' | 'opportunity' | 'proposal';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: string;
  related_item_id?: string;
  related_item_title?: string;
  created_at: string;
  updated_at: string;
  subtasks?: SubTask[];
  assignee?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    avatar_url?: string;
  } | null;
}
