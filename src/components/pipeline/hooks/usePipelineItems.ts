
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

export const usePipelineItems = () => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Task[]>([]);

  const { data: fetchedItems, isLoading, error } = useQuery({
    queryKey: ['unified-pipeline'],
    queryFn: async () => {
      console.log('Fetching unified pipeline items...');
      const [tasksResponse, dealsResponse] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            assignee:assignee_id (
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (tasksResponse.error) throw tasksResponse.error;
      if (dealsResponse.error) throw dealsResponse.error;

      // Convert deals to task format for unified view
      const dealsAsTasks: Task[] = dealsResponse.data.map(deal => ({
        id: deal.id,
        title: deal.title,
        description: deal.description || "",
        status: deal.status === "new" ? "todo" : 
               deal.status === "negotiation" ? "in_progress" : 
               deal.status === "won" ? "completed" : "todo",
        assignee_id: deal.employee_id,
        due_date: deal.expected_close_date,
        priority: deal.priority as Task['priority'],
        type: "opportunity",
        item_type: "opportunity" as const,
        related_item_id: deal.id,
        related_item_title: `${deal.title} (${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(deal.value)})`,
        created_at: deal.created_at,
        updated_at: deal.updated_at
      }));

      const tasks: Task[] = tasksResponse.data.map(task => ({
        ...task,
        item_type: "task" as const,
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: `${task.assignee.first_name} ${task.assignee.last_name}`,
          avatar: task.assignee.avatar_url
        } : undefined
      }));

      return [...tasks, ...dealsAsTasks];
    }
  });

  useEffect(() => {
    if (fetchedItems) {
      setItems(fetchedItems);
    }
  }, [fetchedItems]);

  useEffect(() => {
    const channel = supabase
      .channel('unified-pipeline-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unified-pipeline'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { items, setItems, isLoading, error };
};
