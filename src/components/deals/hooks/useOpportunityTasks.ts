
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

type TaskStatus = 'todo' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskType = 'opportunity' | 'proposal' | 'general';

interface RawTask {
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

const fetchAssignee = async (assigneeId: string) => {
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

const fetchTasks = async (opportunityId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const tasks = await Promise.all(
    data.map(async (rawTask: RawTask) => {
      const assignee = rawTask.assignee_id 
        ? await fetchAssignee(rawTask.assignee_id)
        : undefined;

      return {
        ...rawTask,
        item_type: "task" as const,
        assignee
      };
    })
  );

  return tasks;
};

export const useOpportunityTasks = (opportunityId: string | undefined) => {
  return useQuery({
    queryKey: ['opportunity-tasks', opportunityId],
    queryFn: () => opportunityId ? fetchTasks(opportunityId) : Promise.resolve([]),
    enabled: !!opportunityId
  });
};
