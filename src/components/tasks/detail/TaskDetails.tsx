
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";
import TaskDetailHeader from "./TaskDetailHeader";
import TaskMainInfo from "./TaskMainInfo";
import TaskMetadata from "./TaskMetadata";
import { useTaskDetail } from "../hooks/useTaskDetail";
import { SubtaskManager } from "./SubtaskManager";

interface TaskDetailsProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetails = ({ task, isOpen, onClose }: TaskDetailsProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Task | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const { isLoading, updateTaskMutation } = useTaskDetail();

  useEffect(() => {
    if (task) {
      setFormData(task);
      setDate(task.due_date ? new Date(task.due_date) : undefined);
    }
  }, [task]);

  const handleInputChange = (key: keyof Task, value: any) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [key]: value
    });
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (formData && newDate) {
      setFormData({
        ...formData,
        due_date: newDate.toISOString()
      });
    } else if (formData) {
      // Handle clearing the date
      setFormData({
        ...formData,
        due_date: undefined
      });
    }
  };

  const handleSave = () => {
    if (!formData) return;
    updateTaskMutation.mutate(formData, {
      onSuccess: () => {
        // No need to close after save
      }
    });
  };

  if (!formData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="relative">
          <TaskDetailHeader onClose={onClose} />
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <TaskMainInfo 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />

          <TaskMetadata 
            formData={formData}
            date={date}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
          />

          <SubtaskManager
            task={formData}
            onUpdate={handleInputChange}
          />

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isLoading || updateTaskMutation.isPending}
          >
            {updateTaskMutation.isPending ? (
              "Kaydediliyor..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetails;
