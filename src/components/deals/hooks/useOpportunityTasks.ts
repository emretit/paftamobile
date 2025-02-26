
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Flat, non-recursive type definitions
type TaskStatus = 'todo' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskType = 'opportunity' | 'proposal' | 'general';

interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_id?: string | null;
  due_date?: string | null;
  priority: TaskPriority;
  type: TaskType;
  opportunity_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DatabaseEmployee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface TaskWithAssignee extends DatabaseTask {
  assignee?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  item_type: 'task';
}

const fetchAssignee = async (assigneeId: string | null) => {
  if (!assigneeId) return undefined;
  
  const { data } = await supabase
    .from('employees')
    .select('id, first_name, last_name, avatar_url')
    .eq('id', assigneeId)
    .maybeSingle();

  if (!data) return undefined;

  const employee = data as DatabaseEmployee;
  return {
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    avatar: employee.avatar_url
  };
};

const fetchTasks = async (opportunityId: string): Promise<TaskWithAssignee[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const tasks = await Promise.all(
    data.map(async (dbTask: DatabaseTask) => {
      const assignee = await fetchAssignee(dbTask.assignee_id);
      return {
        ...dbTask,
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
      if (!opportunityId) return [] as TaskWithAssignee[];
      return fetchTasks(opportunityId);
    },
    enabled: !!opportunityId
  });
};
