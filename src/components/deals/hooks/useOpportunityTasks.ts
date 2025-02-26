
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define strict types without any recursion
interface TaskAssignee {
  id: string;
  name: string;
  avatar: string | null;
}

interface BaseTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignee_id?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  type: 'opportunity' | 'proposal' | 'general';
  opportunity_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

const fetchAssignee = async (assigneeId: string): Promise<TaskAssignee | undefined> => {
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

const fetchTasks = async (opportunityId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const tasks = await Promise.all(
    (data as BaseTask[]).map(async (task) => {
      const assignee = task.assignee_id 
        ? await fetchAssignee(task.assignee_id)
        : undefined;

      return {
        ...task,
        assignee,
        item_type: 'task' as const
      };
    })
  );

  return tasks;
};

export const useOpportunityTasks = (opportunityId: string | undefined) => {
  return useQuery({
    queryKey: ['opportunity-tasks', opportunityId],
    queryFn: async () => {
      if (!opportunityId) return [];
      return fetchTasks(opportunityId);
    },
    enabled: !!opportunityId
  });
};
