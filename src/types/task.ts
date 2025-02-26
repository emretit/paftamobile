
export interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignee_id?: string;
  assignee?: TaskAssignee;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  type: 'opportunity' | 'proposal' | 'general';
  item_type: 'task' | 'opportunity';
  opportunity_id?: string;
  opportunity?: {
    id: string;
    title: string;
    status: string;
  };
  related_item_id?: string;
  related_item_title?: string;
  created_at?: string;
  updated_at?: string;
}
