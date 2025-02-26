
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

// Simplified assignee type
interface Assignee {
  id: string;
  name: string;
  avatar?: string | null;
}

// Database task type with exact shape from database
interface DbTask {
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

// Helper function to fetch assignee
const fetchAssignee = async (assigneeId: string): Promise<Assignee | undefined> => {
  const { data: employee } = await supabase
    .from('employees')
    .select('id, first_name, last_name, avatar_url')
    .eq('id', assigneeId)
    .maybeSingle();
  
  if (!employee) return undefined;
  
  return {
    id: employee.id,
    name: `${employee.first_name} ${employee.last_name}`,
    avatar: employee.avatar_url
  };
};

// Main fetch function with explicit typing
const fetchTasks = async (opportunityId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Map database tasks to Task type
  const tasks = await Promise.all(
    (data as DbTask[]).map(async (dbTask) => {
      const assignee = dbTask.assignee_id 
        ? await fetchAssignee(dbTask.assignee_id)
        : undefined;

      const task: Task = {
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description,
        status: dbTask.status,
        assignee_id: dbTask.assignee_id,
        assignee,
        due_date: dbTask.due_date,
        priority: dbTask.priority,
        type: dbTask.type,
        item_type: 'task',
        opportunity_id: dbTask.opportunity_id,
        created_at: dbTask.created_at,
        updated_at: dbTask.updated_at
      };

      return task;
    })
  );

  return tasks;
};

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
