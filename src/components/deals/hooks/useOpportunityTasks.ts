
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskAssignee } from "@/types/task";

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

const fetchTasks = async (opportunityId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')  // Basit sorgu yapalım
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    type: task.type,
    item_type: 'task',
    created_at: task.created_at,
    updated_at: task.updated_at
  }));
};

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
