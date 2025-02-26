
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

interface RawTask {
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

interface Assignee {
  id: string;
  name: string;
  avatar?: string | null;
}

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

const transformTask = async (rawTask: RawTask): Promise<Task> => {
  const assignee = rawTask.assignee_id 
    ? await fetchAssignee(rawTask.assignee_id)
    : undefined;

  return {
    ...rawTask,
    item_type: "task" as const,
    assignee
  };
};

const fetchTasks = async (opportunityId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [] as Task[];

  const tasks = await Promise.all(data.map(transformTask));
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
