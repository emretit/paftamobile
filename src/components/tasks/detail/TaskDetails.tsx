
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskDetail } from "../hooks/useTaskDetail";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TaskMetadata from "./TaskMetadata";
import type { Task } from "@/types/task";

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
    updateTaskMutation.mutate(formData, {
      onSuccess: () => {
        onClose();
      }
    });
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
      </div>

      <Button 
        className="w-full"
        onClick={handleSave}
        disabled={updateTaskMutation.isPending}
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
