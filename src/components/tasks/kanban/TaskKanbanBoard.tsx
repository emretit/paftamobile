
import React from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Clock, CheckCircle2, ListTodo, Calendar } from "lucide-react";
import TaskColumn from "../TaskColumn";
import type { Task } from "@/types/task";

export const COLUMNS = [
  { id: "todo" as const, title: "Yapılacaklar", icon: ListTodo },
  { id: "in_progress" as const, title: "Devam Ediyor", icon: Clock },
  { id: "postponed" as const, title: "Ertelendi", icon: Calendar },
  { id: "completed" as const, title: "Tamamlandı", icon: CheckCircle2 },
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
    if (newStatus !== 'todo' && newStatus !== 'in_progress' && newStatus !== 'postponed' && newStatus !== 'completed') {
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col lg:flex-row gap-6">
        {COLUMNS.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            tasks={filterTasks(column.id)}
            onEdit={onEditTask}
            onSelect={onSelectTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskKanbanBoard;
