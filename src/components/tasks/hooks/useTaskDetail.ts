
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export const useTaskDetail = () => {
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Task) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', updatedTask.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla güncellendi');
    },
    onError: (error) => {
      toast.error('Görev güncellenirken hata oluştu: ' + error.message);
    }
  });

  return {
    updateTaskMutation
  };
};
