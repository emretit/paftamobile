
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
  email: string;
  phone?: string;
  position: string;
  department: string;
  hire_date: string;
  status: 'aktif' | 'pasif';
  avatar_url?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  address?: string;
  country?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  id_ssn?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  created_at?: string;
  updated_at?: string;
}
