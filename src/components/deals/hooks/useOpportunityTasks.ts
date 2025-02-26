
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

// Fetch assignee data
const fetchAssignee = async (assigneeId: string | null) => {
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
    avatar: data.avatar_url
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

  // Process tasks
  const processedTasks = await Promise.all(
    data.map(async (task) => ({
      ...task,
      assignee: await fetchAssignee(task.assignee_id),
      item_type: 'task' as const
    }))
  );

  return processedTasks;
};

// Hook
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
