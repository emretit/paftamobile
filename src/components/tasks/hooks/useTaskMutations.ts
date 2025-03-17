
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, TaskStatus, TaskPriority, TaskType, SubTask } from "@/types/task";
import { mockCrmService } from "@/services/mockCrmService";

interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: string;
  related_item_id?: string;
  related_item_title?: string;
  subtasks?: SubTask[];
}

interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string; 
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignee_id?: string;
  due_date?: string;
  related_item_id?: string;
  related_item_title?: string;
  subtasks?: SubTask[];
}

export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      // Handle subtasks serialization
      const serializedData = {
        ...taskData,
        subtasks: taskData.subtasks ? JSON.stringify(taskData.subtasks) : undefined
      };
      
      const { data, error } = await mockCrmService.createTask(serializedData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev başarıyla oluşturuldu");
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Görev oluşturulurken bir hata oluştu");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: UpdateTaskData) => {
      const { id, ...updates } = updatedTask;
      
      // Handle subtasks serialization
      const serializedUpdates = {
        ...updates,
        subtasks: updates.subtasks ? JSON.stringify(updates.subtasks) : undefined
      };
      
      const { data, error } = await mockCrmService.updateTask(id, serializedUpdates);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev başarıyla güncellendi");
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Görev güncellenirken bir hata oluştu");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { success, error } = await mockCrmService.deleteTask(id);
      if (error) throw error;
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev başarıyla silindi");
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast.error("Görev silinirken bir hata oluştu");
    },
  });

  // Wrapper functions to simplify usage
  const createTask = async (taskData: CreateTaskData) => {
    return createTaskMutation.mutateAsync(taskData);
  };

  const updateTask = async (updatedTask: UpdateTaskData) => {
    return updateTaskMutation.mutateAsync(updatedTask);
  };

  const deleteTask = async (id: string) => {
    return deleteTaskMutation.mutateAsync(id);
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation
  };
};
