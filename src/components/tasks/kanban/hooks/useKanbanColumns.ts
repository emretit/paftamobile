
import { useState } from "react";
import { ListTodo, Clock, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";
import type { Task } from "@/types/task";

// Define a type for column configuration
export interface ColumnConfig {
  id: string;
  title: string;
  icon: LucideIcon;
}

// Define the default columns with "postponed" at the end
export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "todo", title: "Yapılacaklar", icon: ListTodo },
  { id: "in_progress", title: "Devam Ediyor", icon: Clock },
  { id: "completed", title: "Tamamlandı", icon: CheckCircle2 },
  { id: "postponed", title: "Ertelendi", icon: Calendar },
];

export const useKanbanColumns = (
  tasks: Task[],
  onUpdateTaskStatus: (id: string, status: Task['status']) => Promise<void>
) => {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

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

    const newColumns = [...columns, { id, title: newColumnTitle, icon: ListTodo }];
    setColumns(newColumns);
    setNewColumnTitle("");
    setIsAddColumnOpen(false);
    toast.success("Yeni sütun eklendi");
  };

  const handleDeleteColumn = (id: string) => {
    if (["todo", "in_progress", "completed", "postponed"].includes(id)) {
      toast.error("Varsayılan sütunlar silinemez");
      return;
    }

    // Check if there are tasks in this column
    const tasksInColumn = tasks.filter(task => task.status === id);
    if (tasksInColumn.length > 0) {
      setColumnToDelete(id);
      return;
    }

    const newColumns = columns.filter(col => col.id !== id);
    setColumns(newColumns);
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

      // Remove the column
      const newColumns = columns.filter(col => col.id !== columnToDelete);
      setColumns(newColumns);
      toast.success("Sütun silindi ve görevler 'Yapılacaklar' sütununa taşındı");
    } catch (error) {
      toast.error("Sütun silinirken bir hata oluştu");
      console.error(error);
    } finally {
      setColumnToDelete(null);
    }
  };

  const isDefaultColumn = (id: string) => {
    return ["todo", "in_progress", "completed", "postponed"].includes(id);
  };

  return {
    columns,
    setColumns,
    isAddColumnOpen,
    setIsAddColumnOpen,
    newColumnTitle,
    setNewColumnTitle,
    columnToDelete,
    setColumnToDelete,
    handleAddColumn,
    handleDeleteColumn,
    confirmDeleteColumn,
    isDefaultColumn
  };
};
