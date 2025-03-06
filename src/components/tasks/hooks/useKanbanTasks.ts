
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export const useKanbanTasks = (
  searchQuery: string,
  selectedEmployee: string | null,
  selectedType: string | null
) => {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch tasks
  const { data: fetchedTasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      console.log('Fetching tasks...');
      const { data: tasksData, error } = await supabase
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
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      console.log('Fetched tasks:', tasksData);
      
      return tasksData.map(task => ({
        ...task,
        assignee: task.assignee ? {
          id: task.assignee.id,
          name: `${task.assignee.first_name} ${task.assignee.last_name}`,
          avatar: task.assignee.avatar_url
        } : undefined
      })) as Task[];
    }
  });

  // Update task status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task['status'] }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      toast.error('Failed to update task status');
      console.error('Error updating task status:', error);
    }
  });

  // Set tasks when data is fetched
  useEffect(() => {
    if (fetchedTasks) {
      console.log('Setting tasks:', fetchedTasks);
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

  // Filter tasks by status
  const filterTasks = (status: Task['status']) => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEmployee = !selectedEmployee || 
        task.assignee_id === selectedEmployee;
      
      const matchesType = !selectedType || 
        task.type === selectedType;

      return task.status === status && matchesSearch && matchesEmployee && matchesType;
    });
  };

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    filterTasks,
    updateTaskMutation
  };
};
