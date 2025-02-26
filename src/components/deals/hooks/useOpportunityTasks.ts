
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignee_id?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  type: 'opportunity' | 'proposal' | 'general';
  opportunity_id?: string;
  related_item_id?: string;
  related_item_title?: string;
  created_at?: string;
  updated_at?: string;
}

interface TaskAssignee {
  id: string;
  name: string;
  avatar?: string;
}

const fetchTaskAssignee = async (assigneeId: string): Promise<TaskAssignee | undefined> => {
  const { data } = await supabase
    .from('employees')
    .select('id, first_name, last_name, avatar_url')
    .eq('id', assigneeId)
    .maybeSingle();
  
  if (!data) return undefined;
  
  return {
    id: data.id,
    name: `${data.first_name} ${data.last_name}`,
    avatar: data.avatar_url
  };
};

const processTask = async (task: DatabaseTask): Promise<Task> => {
  let assignee: TaskAssignee | undefined;
  
  if (task.assignee_id) {
    assignee = await fetchTaskAssignee(task.assignee_id);
  }

  return {
    ...task,
    item_type: "task" as const,
    assignee
  };
};

export const useOpportunityTasks = (opportunityId: string | undefined) => {
  return useQuery({
    queryKey: ['opportunity-tasks', opportunityId],
    queryFn: async () => {
      if (!opportunityId) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const tasks = await Promise.all(
        (data as DatabaseTask[]).map(processTask)
      );

      return tasks;
    },
    enabled: !!opportunityId
  });
};
