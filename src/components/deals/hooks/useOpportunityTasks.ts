
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

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

const fetchTasks = async (opportunityId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [] as Task[];

  const tasks = await Promise.all(
    data.map(async (rawTask) => {
      const assignee = rawTask.assignee_id 
        ? await fetchAssignee(rawTask.assignee_id)
        : undefined;

      return {
        ...rawTask,
        item_type: "task" as const,
        assignee
      } as Task;
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
