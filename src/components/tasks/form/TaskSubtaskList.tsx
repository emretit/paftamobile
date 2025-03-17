
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { SubTask } from "@/types/task";

interface TaskSubtaskListProps {
  subtasks: SubTask[];
  onChange: (subtasks: SubTask[]) => void;
}

const TaskSubtaskList = ({ subtasks, onChange }: TaskSubtaskListProps) => {
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    
    const newSubtask: SubTask = {
      id: uuidv4(),
      title: newSubtaskText.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    
    onChange([...subtasks, newSubtask]);
    setNewSubtaskText("");
  };

  const handleToggleSubtask = (id: string, completed: boolean) => {
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
      <h3 className="text-sm font-medium">Alt Görevler</h3>
      
      <div className="flex gap-2">
        <Input
          placeholder="Alt görev ekleyin"
          value={newSubtaskText}
          onChange={(e) => setNewSubtaskText(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSubtask();
            }
          }}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddSubtask}
        >
          Ekle
        </Button>
      </div>
      
      {subtasks.length > 0 ? (
        <div className="space-y-2 mt-2">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center p-2 border rounded-md group">
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={(checked) => handleToggleSubtask(subtask.id, !!checked)}
                className="mr-2"
              />
              <span className={subtask.completed ? "line-through text-gray-400" : ""}>
                {subtask.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto opacity-0 group-hover:opacity-100"
                onClick={() => handleDeleteSubtask(subtask.id)}
              >
                <Trash2 className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">
          Henüz alt görev eklenmedi
        </p>
      )}
    </div>
  );
};

export default TaskSubtaskList;
