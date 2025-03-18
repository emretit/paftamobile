
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export const useTaskDetail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (task: Partial<Task>) => {
      if (!task.id) throw new Error('Task ID is required');
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .update(task as any) // Type assertion to avoid TypeScript errors
        .eq('id', task.id)
        .select()
        .single();
      
      if (error) throw error;
      setIsLoading(false);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla güncellendi');
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error('Görev güncellenirken hata oluştu: ' + error.message);
      console.error('Error updating task:', error);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      setIsLoading(true);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      setIsLoading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla silindi');
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error('Görev silinirken hata oluştu: ' + error.message);
      console.error('Error deleting task:', error);
    }
  });

  return {
    isLoading,
    updateTaskMutation,
    deleteTaskMutation
  };
};
