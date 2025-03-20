
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";
import { Plus, Trash2, X, ArrowUp, ArrowDown, Edit, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, SubTask } from "@/types/task";
import { toast } from "sonner";

interface SubtaskManagerProps {
  task: Task;
  onUpdate: (subtasks: SubTask[]) => void;
  isUpdating?: boolean;
}

export const SubtaskManager = ({ task, onUpdate, isUpdating = false }: SubtaskManagerProps) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus the input when adding a new subtask
  useEffect(() => {
    if (isAddingSubtask && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingSubtask]);

  // Focus the edit input when editing a subtask
  useEffect(() => {
    if (editingSubtaskId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingSubtaskId]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) {
      toast.error("Alt görev başlığı boş olamaz");
      return;
    }
    
    const newSubtaskItem: SubTask = {
      id: uuidv4(),
      title: newSubtask.trim(),
      completed: false,
      task_id: task.id
    };
    
    const currentSubtasks = task.subtasks || [];
    const updatedSubtasks = [...currentSubtasks, newSubtaskItem];
    
    onUpdate(updatedSubtasks);
    setNewSubtask("");
    setIsAddingSubtask(false);
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    if (!task.subtasks) return;
    
    const updatedSubtasks = task.subtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, completed } : subtask
    );
    
    onUpdate(updatedSubtasks);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!task.subtasks) return;
    
    const updatedSubtasks = task.subtasks.filter(subtask => 
      subtask.id !== subtaskId
    );
    
    onUpdate(updatedSubtasks);
  };

  const handleStartEditing = (subtask: SubTask) => {
    setEditingSubtaskId(subtask.id);
    setEditValue(subtask.title);
  };

  const handleSaveEdit = () => {
    if (!task.subtasks || !editingSubtaskId) return;
    
    if (!editValue.trim()) {
      toast.error("Alt görev başlığı boş olamaz");
      return;
    }
    
    const updatedSubtasks = task.subtasks.map(subtask => 
      subtask.id === editingSubtaskId 
        ? { ...subtask, title: editValue.trim() } 
        : subtask
    );
    
    onUpdate(updatedSubtasks);
    setEditingSubtaskId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingSubtaskId(null);
    setEditValue("");
  };

  const handleMoveSubtask = (subtaskId: string, direction: 'up' | 'down') => {
    if (!task.subtasks || task.subtasks.length < 2) return;
    
    const currentIndex = task.subtasks.findIndex(st => st.id === subtaskId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(task.subtasks.length - 1, currentIndex + 1);
    
    if (newIndex === currentIndex) return;
    
    const updatedSubtasks = [...task.subtasks];
    const [movedItem] = updatedSubtasks.splice(currentIndex, 1);
    updatedSubtasks.splice(newIndex, 0, movedItem);
    
    onUpdate(updatedSubtasks);
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'add') {
        handleAddSubtask();
      } else {
        handleSaveEdit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (type === 'add') {
        setIsAddingSubtask(false);
        setNewSubtask("");
      } else {
        handleCancelEdit();
      }
    }
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
            disabled={isUpdating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Alt Görev Ekle
          </Button>
        )}
      </div>

      {isAddingSubtask && (
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Alt görev başlığı"
            className="flex-1"
            autoFocus
            onKeyDown={(e) => handleKeyDown(e, 'add')}
            disabled={isUpdating}
          />
          <Button 
            size="sm" 
            onClick={handleAddSubtask}
            disabled={isUpdating || !newSubtask.trim()}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setIsAddingSubtask(false);
              setNewSubtask("");
            }}
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {task.subtasks && task.subtasks.length > 0 ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {task.subtasks.map((subtask, index) => (
            <div 
              key={subtask.id} 
              className={cn(
                "flex items-center gap-2 p-3 rounded-md transition-colors",
                subtask.completed ? "bg-gray-50" : "bg-gray-50 hover:bg-gray-100"
              )}
            >
              {editingSubtaskId === subtask.id ? (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    ref={editInputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => handleKeyDown(e, 'edit')}
                    disabled={isUpdating}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSaveEdit}
                    disabled={isUpdating || !editValue.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Checkbox 
                    checked={subtask.completed} 
                    onCheckedChange={(checked) => 
                      handleToggleSubtask(subtask.id, checked === true)
                    }
                    disabled={isUpdating}
                  />
                  <span className={cn(
                    "flex-1",
                    subtask.completed && "line-through text-gray-500"
                  )}>
                    {subtask.title}
                  </span>
                  <div className="flex items-center gap-1">
                    {/* Reordering buttons */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleMoveSubtask(subtask.id, 'up')}
                      disabled={isUpdating || index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleMoveSubtask(subtask.id, 'down')}
                      disabled={isUpdating || index === task.subtasks.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDown className="h-4 w-4 text-gray-500" />
                    </Button>
                    {/* Edit button */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleStartEditing(subtask)}
                      disabled={isUpdating}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    {/* Delete button */}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      disabled={isUpdating}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-md">
          <p>Henüz alt görev bulunmuyor</p>
          <p className="mt-1 text-xs">Alt görev eklemek için "Alt Görev Ekle" butonunu kullanın</p>
        </div>
      )}
    </div>
  );
};
