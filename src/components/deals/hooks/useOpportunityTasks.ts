
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskAssignee } from "@/types/task";

// Fetch assignee data
const fetchAssignee = async (assigneeId: string | null): Promise<TaskAssignee | undefined> => {
  if (!assigneeId) return undefined;
  
  const { data } = await supabase
    .from('employees')
    .select('id, first_name, last_name, avatar_url')
    .eq('id', assigneeId)
    .maybeSingle();

  if (!data) return undefined;

  return {
    id: data.id,
    name: `${data.first_name} ${data.last_name}`,
    avatar: data.avatar_url ?? undefined
  };
};

// Fetch tasks
const fetchTasks = async (opportunityId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Process tasks with explicit typing
  const processedTasks = await Promise.all(
    data.map(async (task): Promise<Task> => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      assignee_id: task.assignee_id ?? undefined,
      assignee: await fetchAssignee(task.assignee_id),
      due_date: task.due_date ?? undefined,
      priority: task.priority,
      type: task.type,
      item_type: 'task',
      opportunity_id: task.opportunity_id ?? undefined,
      created_at: task.created_at ?? undefined,
      updated_at: task.updated_at ?? undefined
    }))
  );

  return processedTasks;
};

// Hook with explicit return type
export const useOpportunityTasks = (opportunityId: string | undefined) => {
  return useQuery({
    queryKey: ['opportunity-tasks', opportunityId],
    queryFn: async (): Promise<Task[]> => {
      if (!opportunityId) return [];
      return fetchTasks(opportunityId);
    },
    enabled: !!opportunityId
  });
};
