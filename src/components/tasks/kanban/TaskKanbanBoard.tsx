
import React, { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Clock, CheckCircle2, ListTodo, Calendar, Plus, Trash2 } from "lucide-react";
import TaskColumn from "../TaskColumn";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Task } from "@/types/task";

export const DEFAULT_COLUMNS = [
  { id: "todo" as const, title: "Yapılacaklar", icon: ListTodo },
  { id: "in_progress" as const, title: "Devam Ediyor", icon: Clock },
  { id: "completed" as const, title: "Tamamlandı", icon: CheckCircle2 },
  { id: "postponed" as const, title: "Ertelendi", icon: Calendar },
] as const;

interface TaskKanbanBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  filterTasks: (status: Task['status']) => Task[];
  onUpdateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  onEditTask?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
}

const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  setTasks,
  filterTasks,
  onUpdateTaskStatus,
  onEditTask,
  onSelectTask
}) => {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    if (!columns.some(col => col.id === newStatus)) {
      return; // Invalid status
    }

    const newTasks = Array.from(tasks);
    const task = newTasks.find(t => t.id === draggableId);
    if (task) {
      task.status = newStatus as Task['status'];
      setTasks(newTasks);

      await onUpdateTaskStatus(draggableId, newStatus as Task['status']);
    }
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      toast.error("Sütun başlığı boş olamaz");
      return;
    }

    // Generate a unique ID (simplified version)
    const id = newColumnTitle.toLowerCase().replace(/\s+/g, '_');
    
    // Check if ID already exists
    if (columns.some(col => col.id === id)) {
      toast.error("Bu isimde bir sütun zaten mevcut");
      return;
    }

    setColumns([...columns, { id: id as any, title: newColumnTitle, icon: ListTodo }]);
    setNewColumnTitle("");
    setIsAddColumnOpen(false);
    toast.success("Yeni sütun eklendi");
  };

  const handleDeleteColumn = (id: string) => {
    if (id === 'todo' || id === 'in_progress' || id === 'completed' || id === 'postponed') {
      toast.error("Varsayılan sütunlar silinemez");
      return;
    }

    // Check if there are tasks in this column
    const tasksInColumn = tasks.filter(task => task.status === id);
    if (tasksInColumn.length > 0) {
      setColumnToDelete(id);
      return;
    }

    setColumns(columns.filter(col => col.id !== id));
    toast.success("Sütun silindi");
  };

  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return;

    try {
      // Move all tasks in this column to 'todo'
      const tasksToMove = tasks.filter(task => task.status === columnToDelete);
      for (const task of tasksToMove) {
        await onUpdateTaskStatus(task.id, 'todo');
      }

      // Update local tasks state
      setTasks(tasks.map(task => 
        task.status === columnToDelete 
          ? { ...task, status: 'todo' } 
          : task
      ));

      // Remove the column
      setColumns(columns.filter(col => col.id !== columnToDelete));
      toast.success("Sütun silindi ve görevler 'Yapılacaklar' sütununa taşındı");
    } catch (error) {
      toast.error("Sütun silinirken bir hata oluştu");
      console.error(error);
    } finally {
      setColumnToDelete(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => setIsAddColumnOpen(true)}
          variant="outline"
          className="text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sütun Ekle
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-6">
          {columns.map((column) => (
            <div key={column.id} className="flex-1 min-w-[300px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <column.icon className="h-5 w-5 text-gray-500" />
                  <h2 className="font-semibold text-gray-900">
                    {column.title} ({filterTasks(column.id as Task['status']).length})
                  </h2>
                </div>
                {column.id !== 'todo' && column.id !== 'in_progress' && 
                 column.id !== 'completed' && column.id !== 'postponed' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteColumn(column.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <TaskColumn
                id={column.id}
                title={column.title}
                icon={column.icon}
                tasks={filterTasks(column.id as Task['status'])}
                onEdit={onEditTask}
                onSelect={onSelectTask}
              />
            </div>
          ))}
        </div>
      </DragDropContext>

      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Sütun Ekle</DialogTitle>
            <DialogDescription>
              Kanban panonuza yeni bir sütun ekleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Sütun başlığı"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddColumnOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={handleAddColumn}>
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!columnToDelete} onOpenChange={(open) => !open && setColumnToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sütunu Sil</DialogTitle>
            <DialogDescription>
              Bu sütunda görevler var. Silmek istediğinizden emin misiniz? Tüm görevler "Yapılacaklar" sütununa taşınacak.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setColumnToDelete(null)}
            >
              İptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteColumn}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskKanbanBoard;
