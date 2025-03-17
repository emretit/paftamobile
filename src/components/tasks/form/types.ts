
import type { TaskPriority, TaskType } from "@/types/task";

export interface FormData {
  title: string;
  description: string;
  priority: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: string;
  related_item_id?: string;
  related_item_title?: string;
}
