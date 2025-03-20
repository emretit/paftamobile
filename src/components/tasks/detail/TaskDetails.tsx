
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, TaskStatus, TaskPriority, TaskType } from "@/types/task";
import TaskMainInfo from "./TaskMainInfo";
import TaskMetadata from "./TaskMetadata";
import { SubtaskManager } from "./subtasks";

interface TaskDetailsProps {
  task: Task;
  onClose?: () => void;
}

const TaskDetails = ({ task, onClose }: TaskDetailsProps) => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Omit<Task, "subtasks">) => {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from("tasks")
        .update(updatedTask)
        .eq("id", task.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev başarıyla güncellendi");
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Görev güncellenirken bir hata oluştu");
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  const handleUpdateStatus = (status: TaskStatus) => {
    const { id, title, description, priority, type, due_date, assignee_id, related_item_id, related_item_type, related_item_title, created_at, updated_at } = task;
    
    updateTaskMutation.mutate({
      id,
      title,
      description,
      status,
      priority,
      type,
      due_date,
      assignee_id,
      related_item_id,
      related_item_type,
      related_item_title,
      created_at,
      updated_at
    });
  };

  const handleUpdatePriority = (priority: TaskPriority) => {
    const { id, title, description, status, type, due_date, assignee_id, related_item_id, related_item_type, related_item_title, created_at, updated_at } = task;
    
    updateTaskMutation.mutate({
      id,
      title,
      description,
      status,
      priority,
      type,
      due_date,
      assignee_id,
      related_item_id,
      related_item_type,
      related_item_title,
      created_at,
      updated_at
    });
  };

  return (
    <div className="space-y-6">
      <TaskMainInfo 
        task={task} 
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdating}
      />
      <TaskMetadata 
        task={task} 
        onUpdatePriority={handleUpdatePriority}
        isUpdating={isUpdating}
      />
      <SubtaskManager taskId={task.id} />
    </div>
  );
};

export default TaskDetails;
