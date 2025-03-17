// Task types - CRM modülü kaldırıldı

export type TaskStatus = "todo" | "in_progress" | "completed" | "postponed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskType = "opportunity" | "proposal" | "general" | "call" | "meeting" | "follow_up";

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "Yapılacak",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  postponed: "Ertelendi"
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek"
};

export const taskTypeLabels: Record<TaskType, string> = {
  opportunity: "Fırsat",
  proposal: "Teklif",
  general: "Genel",
  call: "Arama",
  meeting: "Toplantı",
  follow_up: "Takip"
};

// Empty interfaces after DB tables removal
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
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
  created_at: string;
  updated_at: string;
  related_item_id?: string;
  related_item_title?: string;
  subtasks?: SubTask[];
  
  // Virtual fields from joins
  assignee?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    avatar_url?: string;
  };
}

// Tasks state type for Kanban view (placeholder for now)
export interface TasksState {
  todo: Task[];
  in_progress: Task[];
  completed: Task[];
  postponed: Task[];
}
