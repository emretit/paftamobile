
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useTaskDetail } from "../hooks/useTaskDetail";
import { supabase } from "@/integrations/supabase/client";
import TaskMetadata from "./TaskMetadata";
import { SubtaskManager } from "./subtasks";
import type { Task, SubTask } from "@/types/task";
import { toast } from "sonner";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

const TaskDetails = ({ task, onClose }: TaskDetailsProps) => {
  const [formData, setFormData] = useState<Task>(task);
  const [date, setDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const { updateTaskMutation } = useTaskDetail();
  const [isUpdatingSubtasks, setIsUpdatingSubtasks] = useState(false);

  useEffect(() => {
    setFormData(task);
    setDate(task.due_date ? new Date(task.due_date) : undefined);
  }, [task]);

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    console.log(`Field ${field} changed to:`, value);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    handleInputChange('due_date', newDate?.toISOString());
  };

  const handleSave = () => {
    console.log("Saving form data:", formData);
    
    // Create a copy of the task data without subtasks
    const { subtasks, ...taskDataForUpdate } = formData;
    
    updateTaskMutation.mutate(taskDataForUpdate, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  // Handle subtask updates directly to the database for real-time changes
  const handleSubtaskUpdate = async (subtasks: SubTask[]) => {
    if (!formData.id) return;
    setIsUpdatingSubtasks(true);
    
    try {
      // First update the local state
      handleInputChange('subtasks', subtasks);
      
      // Then update the database
      const { data, error } = await supabase
        .from('tasks')
        .update({ subtasks })
        .eq('id', formData.id)
        .select();
      
      if (error) throw error;
      
      console.log("Subtasks updated successfully:", data);
    } catch (error) {
      console.error("Error updating subtasks:", error);
      toast.error("Alt görevler güncellenirken bir hata oluştu");
      
      // Revert to original subtasks on error
      handleInputChange('subtasks', task.subtasks);
    } finally {
      setIsUpdatingSubtasks(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Görev Detayları</h3>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Görev başlığı"
          className="mb-4"
        />
        <Textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Görev açıklaması"
          className="min-h-[100px] mb-4"
        />
      </div>

      <div className="space-y-4">
        <TaskMetadata
          formData={formData}
          date={date}
          handleInputChange={handleInputChange}
          handleDateChange={handleDateChange}
        />

        <SubtaskManager 
          task={formData} 
          onUpdate={handleSubtaskUpdate}
          isUpdating={isUpdatingSubtasks}
        />
      </div>

      <Button 
        className="w-full"
        onClick={handleSave}
        disabled={updateTaskMutation.isPending || isUpdatingSubtasks}
      >
        {updateTaskMutation.isPending ? "Kaydediliyor..." : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Değişiklikleri Kaydet
          </>
        )}
      </Button>
    </div>
  );
};

export default TaskDetails;
