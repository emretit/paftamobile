
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Task, SubTask } from "@/types/task";
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
  const [subtasks, setSubtasks] = useState<SubTask[]>(taskToEdit?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");
  
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormData>({
    defaultValues: taskToEdit || {
      title: "",
      description: "",
      priority: "medium",
      type: "general",
      subtasks: []
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: task, error } = await supabase
        .from('tasks')
        .insert([{
          ...data,
          status: 'todo',
          subtasks: subtasks
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
      setSubtasks([]);
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
        .update({
          ...data,
          subtasks: subtasks
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
      onClose();
      reset();
      setSubtasks([]);
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  const onSubmit = (data: FormData) => {
    const formData = {
      ...data
    };
    
    if (taskToEdit) {
      updateTaskMutation.mutate(formData);
    } else {
      createTaskMutation.mutate(formData);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const newSubtaskItem: SubTask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    
    setSubtasks(prev => [...prev, newSubtaskItem]);
    setNewSubtask("");
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    setSubtasks(prev => 
      prev.map(subtask => 
        subtask.id === subtaskId ? { ...subtask, completed } : subtask
      )
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId));
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
          
          {/* Subtasks Section */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold">Alt Görevler</h3>
            
            <div className="flex items-center gap-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Alt görev başlığı"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAddSubtask}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ekle
              </Button>
            </div>
            
            {subtasks.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
                    <Checkbox 
                      checked={subtask.completed} 
                      onCheckedChange={(checked) => 
                        handleToggleSubtask(subtask.id, checked === true)
                      } 
                    />
                    <span className={cn(
                      "flex-1",
                      subtask.completed && "line-through text-gray-500"
                    )}>
                      {subtask.title}
                    </span>
                    <Button 
                      type="button"
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteSubtask(subtask.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Alt görev eklenmedi</p>
            )}
          </div>

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
