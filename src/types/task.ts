
export interface TaskAssignee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  name?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed' | 'postponed';
  priority: 'low' | 'medium' | 'high';
  type: 'opportunity' | 'proposal' | 'general';
  item_type: 'task' | 'opportunity';
  assignee_id?: string;
  assignee?: TaskAssignee;
  due_date?: string;
  opportunity_id?: string;
  related_item_id?: string;
  related_item_title?: string;
  created_at?: string;
  updated_at?: string;
  subtasks?: SubTask[];
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}
