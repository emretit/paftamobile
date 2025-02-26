
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
  created_at?: string;
  updated_at?: string;
}

const fetchTasks = async (opportunityId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const enhancedTasks = await Promise.all(
    data.map(async (rawTask: RawTask) => {
      const assignee = rawTask.assignee_id 
        ? await fetchAssignee(rawTask.assignee_id)
        : undefined;

      const task: Task = {
        id: rawTask.id,
        title: rawTask.title,
        description: rawTask.description,
        status: rawTask.status,
        assignee_id: rawTask.assignee_id,
        assignee,
        due_date: rawTask.due_date,
        priority: rawTask.priority,
        type: rawTask.type,
        item_type: 'task',
        opportunity_id: rawTask.opportunity_id,
        created_at: rawTask.created_at,
        updated_at: rawTask.updated_at
      };

      return task;
    })
  );

  return enhancedTasks;
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
