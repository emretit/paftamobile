
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

type TaskStatus = 'todo' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskType = 'opportunity' | 'proposal' | 'general';

interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_id?: string;
  due_date?: string;
  priority: TaskPriority;
  type: TaskType;
  opportunity_id?: string;
  related_item_id?: string;
  related_item_title?: string;
  created_at?: string;
  updated_at?: string;
}

interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string | null;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

const fetchTaskAssignee = async (assigneeId: string): Promise<TaskAssignee | undefined> => {
  const { data } = await supabase
    .from('employees')
    .select('id, first_name, last_name, avatar_url')
    .eq('id', assigneeId)
    .maybeSingle();
  
  if (!data) return undefined;

  const employee = data as Employee;
  
  return {
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    avatar: employee.avatar_url
  };
};

export const useOpportunityTasks = (opportunityId: string | undefined) => {
  return useQuery<Task[], Error>({
    queryKey: ['opportunity-tasks', opportunityId],
    queryFn: async () => {
      if (!opportunityId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const tasks: Task[] = await Promise.all(
        data.map(async (rawTask: DatabaseTask) => {
          const assignee = rawTask.assignee_id 
            ? await fetchTaskAssignee(rawTask.assignee_id)
            : undefined;

          return {
            ...rawTask,
            item_type: "task",
            assignee
          };
        })
      );

      return tasks;
    },
    enabled: !!opportunityId
  });
};
