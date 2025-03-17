
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, TaskStatus, TaskPriority, TaskType, SubTask } from "@/types/task";
import * as mockCrmService from "@/services/mockCrmService";

interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigned_to?: string;
  due_date?: string;
  related_item_id?: string;
  related_item_title?: string;
  related_item_type?: string;
  subtasks?: SubTask[];
}

interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string; 
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assigned_to?: string;
  due_date?: string;
  related_item_id?: string;
  related_item_title?: string;
  related_item_type?: string;
  subtasks?: SubTask[];
}

export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      // Add created_at and updated_at fields
      const fullTaskData = {
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Handle subtasks as a separate property (convert to JSON string)
      const taskWithSubtasksAsString = {
        ...fullTaskData,
        // Only include subtasks in serialized form if they exist
        ...(fullTaskData.subtasks ? { subtasks: JSON.stringify(fullTaskData.subtasks) } : {})
      };
      
      const { data, error } = await mockCrmService.mockTasksAPI.createTask(taskWithSubtasksAsString);
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
      
      // Update the updated_at timestamp
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      // Handle subtasks as a separate property (convert to JSON string)
      const updatesWithSubtasksAsString = {
        ...updatesWithTimestamp,
        // Only include subtasks in serialized form if they exist
        ...(updatesWithTimestamp.subtasks ? { subtasks: JSON.stringify(updatesWithTimestamp.subtasks) } : {})
      };
      
      const { data, error } = await mockCrmService.mockTasksAPI.updateTask(id, updatesWithSubtasksAsString);
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
      const { success, error } = await mockCrmService.mockTasksAPI.deleteTask(id);
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

  return {
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation
  };
};
