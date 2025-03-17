
import { useState } from "react";
import { PlusCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle,
      completed: false,
      created_at: new Date().toISOString()
    };

    onChange([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const handleRemoveSubtask = (id: string) => {
    onChange(subtasks.filter(item => item.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    onChange(
      subtasks.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Alt Görevler</h3>
        <span className="text-xs text-muted-foreground">
          {subtasks.filter(s => s.completed).length} / {subtasks.length} tamamlandı
        </span>
      </div>

      {subtasks.length > 0 && (
        <ul className="space-y-2">
          {subtasks.map(subtask => (
            <li
              key={subtask.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => handleToggleSubtask(subtask.id)}
                  className={`w-5 h-5 mr-2 rounded-full flex items-center justify-center ${
                    subtask.completed
                      ? "bg-green-500 text-white"
                      : "border border-gray-300"
                  }`}
                >
                  {subtask.completed && <Check className="h-3 w-3" />}
                </button>
                <span
                  className={`text-sm ${
                    subtask.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {subtask.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSubtask(subtask.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Yeni alt görev ekle"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddSubtask();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSubtask}
          disabled={!newSubtaskTitle.trim()}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Ekle
        </Button>
      </div>
    </div>
  );
};

export default TaskSubtaskList;
