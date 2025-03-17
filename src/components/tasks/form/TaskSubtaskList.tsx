
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";
import { SubTask } from "@/types/task";

interface TaskSubtaskListProps {
  subtasks: SubTask[];
  onChange: (subtasks: SubTask[]) => void;
}

const TaskSubtaskList = ({ subtasks, onChange }: TaskSubtaskListProps) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: SubTask = {
      id: uuidv4(),
      title: newSubtaskTitle.trim(),
      completed: false,
      task_id: ""  // Will be filled when saved
    };

    onChange([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
    setIsAddingSubtask(false);
  };

  const handleToggleSubtask = (id: string, checked: boolean) => {
    const updatedSubtasks = subtasks.map(subtask => {
      if (subtask.id === id) {
        return { ...subtask, completed: checked };
      }
      return subtask;
    });
    onChange(updatedSubtasks);
  };

  const handleDeleteSubtask = (id: string) => {
    onChange(subtasks.filter(subtask => subtask.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Alt Görevler</h3>
        {!isAddingSubtask && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingSubtask(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Alt Görev Ekle
          </Button>
        )}
      </div>

      {isAddingSubtask && (
        <div className="flex items-center gap-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Alt görev başlığı girin"
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddSubtask}
          >
            Ekle
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingSubtask(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {subtasks.length > 0 ? (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center gap-2 bg-gray-50 p-2 rounded-md"
            >
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={(checked) => handleToggleSubtask(subtask.id, !!checked)}
              />
              <span className={`flex-1 ${subtask.completed ? "line-through text-gray-500" : ""}`}>
                {subtask.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSubtask(subtask.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Henüz alt görev yok</p>
      )}
    </div>
  );
};

export default TaskSubtaskList;
