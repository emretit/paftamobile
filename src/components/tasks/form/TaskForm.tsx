
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "@/types/task";
import { FormValues } from "./types";
import TaskBasicInfo from "./TaskBasicInfo";
import TaskMetadata from "./TaskMetadata";
import TaskAssignment from "./TaskAssignment";
import TaskRelatedItem from "./TaskRelatedItem";
import FormActions from "./FormActions";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      type: task?.type || "general",
      assignee_id: task?.assignee_id || undefined,
      due_date: task?.due_date ? new Date(task.due_date) : undefined,
      related_item_id: task?.related_item_id || undefined,
      related_item_type: task?.related_item_type || undefined,
      related_item_title: task?.related_item_title || undefined,
    }
  });

  const relatedItemType = watch("related_item_type");
  const taskType = watch("type");

  // Effect to reset related_item_id when related_item_type changes
  useEffect(() => {
    if (relatedItemType) {
      setValue("related_item_id", undefined);
      setValue("related_item_title", undefined);
    }
  }, [relatedItemType, setValue]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Format the data for the API
      const taskData = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        type: data.type,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        related_item_id: data.related_item_id || null,
        related_item_type: data.related_item_type || null,
        related_item_title: data.related_item_title || null,
      };

      const { data: newTask, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;
      return newTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev başarıyla oluşturuldu");
      reset();
      onClose();
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast.error("Görev oluşturulurken bir hata oluştu");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!task) throw new Error("Task is required for update");

      // Format the data for the API
      const taskData = {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        type: data.type,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date ? data.due_date.toISOString() : null,
        related_item_id: data.related_item_id || null,
        related_item_type: data.related_item_type || null,
        related_item_title: data.related_item_title || null,
      };

      const { data: updatedTask, error } = await supabase
        .from("tasks")
        .update(taskData)
        .eq("id", task.id)
        .select()
        .single();

      if (error) throw error;
      return updatedTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Görev başarıyla güncellendi");
      onClose();
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast.error("Görev güncellenirken bir hata oluştu");
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (task) {
        await updateTaskMutation.mutateAsync(data);
      } else {
        await createTaskMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {task ? "Görevi Düzenle" : "Yeni Görev"}
        </h2>
      </div>
      
      <div className="space-y-4">
        <TaskBasicInfo register={register} errors={errors} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Durum</label>
            <select 
              {...register("status")}
              className="border rounded px-3 py-2"
            >
              <option value="todo">Yapılacak</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="postponed">Ertelendi</option>
            </select>
          </div>
          
          <TaskMetadata 
            watch={watch} 
            setValue={setValue} 
          />
        </div>
        
        <TaskAssignment 
          watch={watch} 
          setValue={setValue} 
        />

        <TaskRelatedItem 
          taskType={taskType} 
          watch={watch}
          setValue={setValue}
        />
      </div>
      
      <FormActions 
        onClose={onClose} 
        isEditing={!!task} 
        isSubmitting={isSubmitting} 
      />
    </form>
  );
}
