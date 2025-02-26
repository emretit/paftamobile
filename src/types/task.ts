
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
  priority: 'low' | 'medium' | 'high';
  type: 'opportunity' | 'proposal' | 'general';
  item_type: 'task' | 'opportunity';  // opportunity tipini ekledik
  assignee_id?: string;
  assignee?: TaskAssignee;
  due_date?: string;
  opportunity_id?: string;
  related_item_id?: string;
  related_item_title?: string;
  created_at?: string;
  updated_at?: string;
}
