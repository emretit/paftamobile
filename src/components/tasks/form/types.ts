
import type { Task, SubTask } from "@/types/task";

export interface FormData {
  title: string;
  description: string;
  priority: Task['priority'];
  type: Task['type'];
  assignee_id?: string;
  due_date?: string;
  related_item_id?: string;
  related_item_title?: string;
  subtasks?: SubTask[];
}
