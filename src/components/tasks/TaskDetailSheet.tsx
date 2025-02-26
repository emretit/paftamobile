
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Task } from "@/types/task";

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSheet = ({ task, isOpen, onClose }: TaskDetailSheetProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Task | null>(task);

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      if (!task?.id) throw new Error('Task ID is required');

      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      return updatedTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Görev güncellendi');
    },
    onError: (error) => {
      toast.error('Görev güncellenirken bir hata oluştu');
      console.error('Error updating task:', error);
    }
  });

  const handleChange = (field: keyof Task, value: any) => {
    if (!formData) return;

    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    updateTaskMutation.mutate({ [field]: value });
  };

  if (!formData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-left">Görev Detayları</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Görev başlığı"
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Textarea
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Görev açıklaması"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
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

            <div className="space-y-2">
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">Yapılacak</SelectItem>
                  <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select
                value={formData.assignee_id || ""}
                onValueChange={(value) => handleChange("assignee_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Atanan kişi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(new Date(formData.due_date), "PPP") : "Bitiş tarihi seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={(date) => handleChange("due_date", date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailSheet;
