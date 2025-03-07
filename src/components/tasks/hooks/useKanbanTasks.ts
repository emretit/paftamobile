
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export const useKanbanTasks = (
  searchQuery: string,
  selectedEmployee: string | null,
  selectedType: string | null
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", searchQuery, selectedEmployee, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, name:first_name, avatar_url)
        `);

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedEmployee) {
        query = query.eq('assignee_id', selectedEmployee);
      }

      if (selectedType) {
        // Check if selectedType is a valid task type
        const validTypes = ['opportunity', 'proposal', 'general'];
        if (validTypes.includes(selectedType)) {
          query = query.eq('type', selectedType as Task['type']);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Gelen veriyi Task tipine dönüştür
      return data.map((item: any) => ({
        ...item,
        item_type: item.item_type || 'task', // Varsayılan değer atıyoruz
        assignee: item.assignee ? {
          id: item.assignee.id,
          name: item.assignee.name,
          avatar: item.assignee.avatar_url
        } : undefined
      })) as Task[];
    }
  });

  useEffect(() => {
    if (data) {
      setTasks(data);
    }
  }, [data]);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task['status'] }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev durumu güncellendi');
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  const filterTasks = useCallback((status: string) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    filterTasks,
    updateTaskMutation
  };
};
