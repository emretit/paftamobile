
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Simple, flat type definitions without any nesting
type TaskStatus = 'todo' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';
type TaskType = 'opportunity' | 'proposal' | 'general';

// Simplified database interfaces
interface RawTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_id: string | null;
  due_date: string | null;
  priority: TaskPriority;
  type: TaskType;
  opportunity_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface RawEmployee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

// Simple assignee object
interface SimpleAssignee {
  id: string;
  name: string;
  avatar: string | null;
}

// Fetch assignee data
const fetchAssignee = async (assigneeId: string | null): Promise<SimpleAssignee | undefined> => {
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
const fetchTasks = async (opportunityId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Process tasks
  const processedTasks = await Promise.all(
    data.map(async (task: RawTask) => {
      return {
        ...task,
        assignee: await fetchAssignee(task.assignee_id),
        item_type: 'task' as const
      };
    })
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
