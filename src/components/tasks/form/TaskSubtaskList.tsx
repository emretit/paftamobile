
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash } from "lucide-react";
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
      id: uuidv4(),
      title: newSubtaskTitle.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    
    onChange([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    onChange(
      subtasks.map(subtask => 
        subtask.id === subtaskId ? { ...subtask, completed } : subtask
      )
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    onChange(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Alt Görevler</h3>
      
      <div className="flex gap-2">
        <Input
          placeholder="Alt görev ekle..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button type="button" onClick={handleAddSubtask} size="sm">
          Ekle
        </Button>
      </div>
      
      {subtasks.length > 0 ? (
        <ul className="space-y-2">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id={`subtask-${subtask.id}`}
                  checked={subtask.completed}
                  onCheckedChange={(checked) => handleToggleSubtask(subtask.id, checked === true)}
                />
                <label 
                  htmlFor={`subtask-${subtask.id}`}
                  className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : ''}`}
                >
                  {subtask.title}
                </label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteSubtask(subtask.id)}
                className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
              >
                <Trash size={16} />
                <span className="sr-only">Sil</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">
          Herhangi bir alt görev eklenmedi
        </p>
      )}
    </div>
  );
};

export default TaskSubtaskList;
