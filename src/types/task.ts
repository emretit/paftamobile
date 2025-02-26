
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignee_id?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  type: 'opportunity' | 'proposal' | 'general';
  related_item_id?: string;
  related_item_title?: string;
  created_at?: string;
  updated_at?: string;
}
