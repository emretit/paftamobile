
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task, SubTask } from "@/types/task";

export const useTaskDetail = (task: Task | null) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Task | null>(task);
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      if (!task?.id) throw new Error('Task ID is required');

      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      return updatedTask as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev güncellendi');
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  const handleChange = (field: keyof Task, value: any) => {
    if (!formData) return;

    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    updateTaskMutation.mutate({ [field]: value });
  };

  return {
    formData,
    setFormData,
    newSubtask,
    setNewSubtask,
    isAddingSubtask,
    setIsAddingSubtask,
    employees,
    updateTaskMutation,
    handleChange
  };
};
