
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

type DatabaseTask = {
  id: string;
  title: string;
  description: string;
  status: Task['status'];
  assignee_id?: string;
  due_date?: string;
  priority: Task['priority'];
  type: Task['type'];
  opportunity_id?: string;
  created_at?: string;
  updated_at?: string;
};

const fetchTasks = async (opportunityId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const enhancedTasks = await Promise.all(
    (data as DatabaseTask[]).map(async (task) => {
      const assignee = task.assignee_id 
        ? await fetchAssignee(task.assignee_id)
        : undefined;

      return {
        ...task,
        item_type: "task" as const,
        assignee
      };
    })
  );

  return enhancedTasks;
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
