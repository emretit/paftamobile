
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FormData } from "../form/types";
import type { SubTask, Task } from "@/types/task";

export const useTaskMutations = (
  onSuccess: () => void,
  taskToEdit?: Task | null
) => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (data: { formData: FormData; subtasks: SubTask[] }) => {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert([{
          ...data.formData,
          status: 'todo',
          subtasks: data.subtasks
        }])
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

      const { data: task, error } = await supabase
        .from('tasks')
        .update({
          ...data.formData,
          subtasks: data.subtasks
        })
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
