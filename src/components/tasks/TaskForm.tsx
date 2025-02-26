
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";
import type { FormData } from "./form/types";
import TaskBasicInfo from "./form/TaskBasicInfo";
import TaskMetadata from "./form/TaskMetadata";
import TaskAssignment from "./form/TaskAssignment";
import TaskRelatedItem from "./form/TaskRelatedItem";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

const TaskForm = ({ isOpen, onClose, taskToEdit }: TaskFormProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormData>({
    defaultValues: taskToEdit || {
      title: "",
      description: "",
      priority: "medium",
      type: "general",
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert([{
          ...data,
          status: 'todo'
        }])
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla oluşturuldu');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error('Görev oluşturulurken bir hata oluştu');
      console.error('Error creating task:', error);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!taskToEdit?.id) throw new Error('Task ID is required for updates');

      const { data: task, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', taskToEdit.id)
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev başarıyla güncellendi');
      onClose();
      reset();
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  const onSubmit = (data: FormData) => {
    if (taskToEdit) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {taskToEdit ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <TaskBasicInfo register={register} />
          <TaskMetadata watch={watch} setValue={setValue} />
          <TaskAssignment watch={watch} setValue={setValue} />
          <TaskRelatedItem watch={watch} setValue={setValue} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">
              {taskToEdit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
