
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SubTask } from "@/types/task";

interface TaskSubtaskListProps {
  subtasks: SubTask[];
  onChange: (subtasks: SubTask[]) => void;
}

const TaskSubtaskList = ({ subtasks, onChange }: TaskSubtaskListProps) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask: SubTask = {
      id: crypto.randomUUID(),
      title: newSubtaskTitle.trim(),
      completed: false,
      task_id: ""
    };
    
    onChange([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const handleSubtaskToggle = (id: string, completed: boolean) => {
    onChange(
      subtasks.map(subtask => 
        subtask.id === id ? { ...subtask, completed } : subtask
      )
    );
  };

  const handleDeleteSubtask = (id: string) => {
    onChange(subtasks.filter(subtask => subtask.id !== id));
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Alt Görevler</h3>
      
      <div className="flex gap-2">
        <Input
          placeholder="Alt görev ekle"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddSubtask();
            }
          }}
        />
        <Button type="button" onClick={handleAddSubtask} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {subtasks.length === 0 ? (
          <div className="text-sm text-gray-500 py-2">
            Henüz alt görev eklenmedi.
          </div>
        ) : (
          subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={(checked) => 
                    handleSubtaskToggle(subtask.id, checked as boolean)
                  }
                  id={`subtask-${subtask.id}`}
                />
                <label
                  htmlFor={`subtask-${subtask.id}`}
                  className={`text-sm ${subtask.completed ? "line-through text-gray-400" : ""}`}
                >
                  {subtask.title}
                </label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSubtask(subtask.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskSubtaskList;
