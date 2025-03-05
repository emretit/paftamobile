
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox"
import { v4 as uuidv4 } from "uuid";
import type { Task, SubTask } from "@/types/task";

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSheet = ({ task, isOpen, onClose }: TaskDetailSheetProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Task | null>(task);
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

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

  const handleAddSubtask = () => {
    if (!formData || !newSubtask.trim()) return;
    
    const newSubtaskItem: SubTask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    
    const currentSubtasks = formData.subtasks || [];
    const updatedSubtasks = [...currentSubtasks, newSubtaskItem];
    
    setFormData({
      ...formData,
      subtasks: updatedSubtasks
    });
    
    updateTaskMutation.mutate({ subtasks: updatedSubtasks });
    setNewSubtask("");
    setIsAddingSubtask(false);
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    if (!formData || !formData.subtasks) return;
    
    const updatedSubtasks = formData.subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, completed } : subtask
    );
    
    setFormData({
      ...formData,
      subtasks: updatedSubtasks
    });
    
    updateTaskMutation.mutate({ subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!formData || !formData.subtasks) return;
    
    const updatedSubtasks = formData.subtasks.filter(subtask => 
      subtask.id !== subtaskId
    );
    
    setFormData({
      ...formData,
      subtasks: updatedSubtasks
    });
    
    updateTaskMutation.mutate({ subtasks: updatedSubtasks });
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

            {/* Subtasks section */}
            <div className="space-y-3 border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">Alt Görevler</h3>
                {!isAddingSubtask && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsAddingSubtask(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Alt Görev Ekle
                  </Button>
                )}
              </div>

              {isAddingSubtask && (
                <div className="flex items-center gap-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Alt görev başlığı"
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddSubtask}>
                    Ekle
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsAddingSubtask(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {formData.subtasks && formData.subtasks.length > 0 ? (
                <div className="space-y-2">
                  {formData.subtasks.map((subtask) => (
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
                <p className="text-sm text-muted-foreground">Alt görev bulunmuyor</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailSheet;
