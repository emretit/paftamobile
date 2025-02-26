
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import TaskCard from "../tasks/TaskCard";
import type { Task } from "@/types/task";
import type { Deal } from "@/types/deal";

interface OpportunityTasksProps {
  opportunity: Deal;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
}

const OpportunityTasks = ({ opportunity, tasks, onEditTask, onSelectTask }: OpportunityTasksProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Görev başlığı gerekli');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          ...newTask,
          opportunity_id: opportunity.id,
          status: 'todo',
          type: 'opportunity',
          item_type: 'task',
        }]);

      if (error) throw error;

      toast.success('Görev başarıyla oluşturuldu');
      setNewTask({ title: "", description: "", due_date: "" });
      setIsAdding(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Görev oluşturulurken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Görevler</h3>
        <Button 
          size="sm" 
          onClick={() => setIsAdding(true)}
          className="hover:bg-[#F1F0FB] hover:text-[#9b87f5]"
        >
          Görev Ekle
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg border">
          <Input
            placeholder="Görev başlığı"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="Açıklama"
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newTask.due_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newTask.due_date ? format(new Date(newTask.due_date), "PPP") : "Tarih seç"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newTask.due_date ? new Date(newTask.due_date) : undefined}
                onSelect={(date) => setNewTask(prev => ({ 
                  ...prev, 
                  due_date: date ? date.toISOString() : "" 
                }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsAdding(false)}
            >
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz görev eklenmemiş</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onSelect={onSelectTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OpportunityTasks;
