
// Define the status options for tasks
export type TaskStatus = "todo" | "in_progress" | "completed" | "postponed";

// Define the priority levels for tasks
export type TaskPriority = "low" | "medium" | "high";

// Define the types of tasks - extending with new types
export type TaskType = "opportunity" | "proposal" | "general" | "email" | "meeting" | "call" | "follow_up";

// Define the structure for subtasks
export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

// Define the main Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
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
  
  // Used for drag and drop identification
  item_type?: string;
}
