
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task, TaskStatus, TaskType } from "@/types/task";
import { mockTasksAPI } from "@/services/mockCrmService";

export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  // Create a new task
  const createTask = useMutation({
    mutationFn: async (taskData: {
      title: string;
      description: string;
      priority: string;
      type: TaskType;
      assignee_id?: string;
      due_date?: string;
      related_item_id?: string;
      related_item_title?: string;
      subtasks?: string; // Serialized JSON of subtasks
    }) => {
      const { subtasks, ...taskFields } = taskData;
      
      // For database submission we need to convert the type
      const taskToCreate = {
        ...taskFields,
        status: "todo" as TaskStatus,
        // Validate task type
        type: (taskFields.type === "opportunity" || 
               taskFields.type === "proposal" || 
               taskFields.type === "general" || 
               taskFields.type === "meeting" || 
               taskFields.type === "call" || 
               taskFields.type === "email" || 
               taskFields.type === "follow_up") ? taskFields.type : "general"
      };
      
      const { data, error } = await mockTasksAPI.createTask(taskToCreate);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev oluşturuldu");
    },
    onError: (error: Error) => {
      toast.error("Görev oluşturulurken bir hata oluştu");
      console.error("Error creating task:", error);
    },
  });

  // Update an existing task
  const updateTask = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Task>;
    }) => {
      const { data, error } = await mockTasksAPI.updateTask(id, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev güncellendi");
    },
    onError: (error: Error) => {
      toast.error("Görev güncellenirken bir hata oluştu");
      console.error("Error updating task:", error);
    },
  });

  // Delete a task
  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await mockTasksAPI.deleteTask?.(id) || { error: null };
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev silindi");
    },
    onError: (error: Error) => {
      toast.error("Görev silinirken bir hata oluştu");
      console.error("Error deleting task:", error);
    },
  });

  return {
    createTask,
    updateTask,
    deleteTask,
  };
};
