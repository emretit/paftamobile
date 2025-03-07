
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";
import type { Deal } from "@/types/deal";
import type { PipelineItem } from "@/types/pipeline";

export const usePipelineItems = () => {
  const [items, setItems] = useState<Task[]>([]);

  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ["pipeline-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, name:first_name, avatar_url)
        `);

      if (error) throw error;
      
      return data.map((item: any) => ({
        ...item,
        item_type: 'task',
        assignee: item.assignee ? {
          id: item.assignee.id,
          name: item.assignee.name,
          avatar: item.assignee.avatar_url
        } : undefined
      })) as Task[];
    }
  });

  useEffect(() => {
    if (tasks) {
      setItems(tasks);
    }
  }, [tasks]);

  return {
    items,
    setItems,
    isLoading: tasksLoading,
    error: tasksError
  };
};
