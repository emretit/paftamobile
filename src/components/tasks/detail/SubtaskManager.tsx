
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, SubTask } from "@/types/task";

interface SubtaskManagerProps {
  task: Task;
  onUpdate: (field: keyof Task, value: any) => void;
}

export const SubtaskManager = ({ task, onUpdate }: SubtaskManagerProps) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const newSubtaskItem: SubTask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      task_id: task.id
    };
    
    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = [...currentSubtasks, newSubtaskItem];
    
    onUpdate("subtasks", updatedSubtasks);
    setNewSubtask("");
    setIsAddingSubtask(false);
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    if (!task.subtasks) return;
    
    const updatedSubtasks = task.subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, completed } : subtask
    );
    
    onUpdate("subtasks", updatedSubtasks);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!task.subtasks) return;
    
    const updatedSubtasks = task.subtasks.filter(subtask => 
      subtask.id !== subtaskId
    );
    
    onUpdate("subtasks", updatedSubtasks);
  };

  return (
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

      {task.subtasks && task.subtasks.length > 0 ? (
        <div className="space-y-2">
          {task.subtasks.map((subtask) => (
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
  );
};
