
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FormData } from "../form/types";
import type { SubTask, Task, TaskStatus } from "@/types/task";

export const useTaskMutations = (
  onSuccess: () => void,
  taskToEdit?: Task | null
) => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (data: { formData: FormData; subtasks: SubTask[] }) => {
      // Store the task data but handle subtasks as JSON
      const taskData = {
        ...data.formData,
        status: 'todo' as TaskStatus,
        // Store subtasks as a JSON field
        subtasks: JSON.stringify(data.subtasks)
      };

      const { data: task, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla oluşturuldu');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Görev oluşturulurken bir hata oluştu');
      console.error('Error creating task:', error);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { formData: FormData; subtasks: SubTask[] }) => {
      if (!taskToEdit?.id) throw new Error('Task ID is required for updates');

      // Store the task data but handle subtasks as JSON
      const taskData = {
        ...data.formData,
        // Store subtasks as a JSON field
        subtasks: JSON.stringify(data.subtasks)
      };

      const { data: task, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskToEdit.id)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla güncellendi');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  return {
    createTaskMutation,
    updateTaskMutation
  };
};
