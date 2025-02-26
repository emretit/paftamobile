
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

// Simplified database types to avoid deep nesting
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
  created_at?: string;
  updated_at?: string;
}

interface DatabaseEmployee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

// Fetch assignee details
const fetchAssignee = async (assigneeId: string) => {
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

// Fetch tasks for an opportunity
const fetchTasks = async (opportunityId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const tasks = await Promise.all(
    data.map(async (dbTask: DatabaseTask) => {
      const assignee = dbTask.assignee_id 
        ? await fetchAssignee(dbTask.assignee_id)
        : undefined;

      return {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        status: dbTask.status,
        assignee_id: dbTask.assignee_id,
        assignee: assignee,
        due_date: dbTask.due_date,
        priority: dbTask.priority,
        type: dbTask.type,
        item_type: 'task' as const,
        opportunity_id: dbTask.opportunity_id,
        created_at: dbTask.created_at,
        updated_at: dbTask.updated_at
      } satisfies Task;
    })
  );

  return tasks;
};

// Hook for fetching opportunity tasks
export const useOpportunityTasks = (opportunityId: string | undefined) => {
  return useQuery({
    queryKey: ['opportunity-tasks', opportunityId],
    queryFn: async () => {
      if (!opportunityId) return [] as Task[];
      return fetchTasks(opportunityId);
    },
    enabled: !!opportunityId
  });
};
