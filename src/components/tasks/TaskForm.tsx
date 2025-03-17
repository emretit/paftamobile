
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task, TaskType, TaskStatus, TaskPriority } from "@/types/task";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

type FormValues = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: Date;
};

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
      type: task?.type || "general",
      assignee_id: task?.assignee_id || undefined,
      due_date: task?.due_date ? new Date(task.due_date) : undefined,
    }
  });

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
        <div className="grid gap-2">
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            placeholder="Görev başlığı"
            {...register("title", { required: "Başlık zorunludur" })}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            placeholder="Görev açıklaması"
            rows={3}
            {...register("description")}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Durum</Label>
            <Select 
              value={watch("status")} 
              onValueChange={(value) => setValue("status", value as TaskStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Yapılacak</SelectItem>
                <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="postponed">Ertelendi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Öncelik</Label>
            <Select 
              value={watch("priority")} 
              onValueChange={(value) => setValue("priority", value as TaskPriority)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Öncelik seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Düşük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="high">Yüksek</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Tür</Label>
            <Select 
              value={watch("type")} 
              onValueChange={(value) => setValue("type", value as TaskType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Genel</SelectItem>
                <SelectItem value="call">Arama</SelectItem>
                <SelectItem value="meeting">Toplantı</SelectItem>
                <SelectItem value="follow_up">Takip</SelectItem>
                <SelectItem value="proposal">Teklif</SelectItem>
                <SelectItem value="opportunity">Fırsat</SelectItem>
                <SelectItem value="reminder">Hatırlatma</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="due_date">Bitiş Tarihi</Label>
            <DatePicker 
              selected={watch("due_date")} 
              onSelect={(date) => setValue("due_date", date)} 
              placeholder="Bitiş tarihi seçin" 
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          disabled={isSubmitting}
        >
          İptal
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Kaydediliyor..." : task ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
