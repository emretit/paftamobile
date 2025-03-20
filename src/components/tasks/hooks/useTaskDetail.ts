
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export const useTaskDetail = () => {
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Task) => {
      console.log("Updating task:", updatedTask);
      
      // Only send the fields we want to update to avoid type errors
      const taskForUpdate = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        priority: updatedTask.priority,
        type: updatedTask.type || 'general',
        due_date: updatedTask.due_date,
        assignee_id: updatedTask.assignee_id,
        // subtasks are handled separately in the component
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .update(taskForUpdate)
        .eq('id', updatedTask.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating task:", error);
        throw error;
      }
      
      console.log("Task updated successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla güncellendi');
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error('Görev güncellenirken hata oluştu: ' + error.message);
    }
  });

  return {
    updateTaskMutation
  };
};
