
import { useState, useCallback } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Task } from "@/types/task";
import { Card, CardContent } from "@/components/ui/card";
import { KanbanColumn } from "./KanbanColumn";
import { useTaskMutations } from "./hooks/useTaskMutations";
import { useKanbanTasks } from "./hooks/useKanbanTasks";

interface TasksKanbanProps {
  searchQuery: string;
  selectedEmployee: string | null;
  selectedType: string | null;
  onSelectTask: (task: Task) => void;
}

const TasksKanban = ({
  searchQuery,
  selectedEmployee,
  selectedType,
  onSelectTask,
}: TasksKanbanProps) => {
  const { updateTask } = useTaskMutations();
  const { tasks, isLoading, error, filterTasks } = useKanbanTasks({
    searchQuery,
    selectedEmployee,
    selectedType
  });
  
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  
  // Apply filters when dependencies change
  useState(() => {
    setFilteredTasks(filterTasks(tasks, searchQuery, selectedEmployee, selectedType));
  });

  const handleDragEnd = useCallback(
    (result: any) => {
      const { destination, source, draggableId } = result;

      // Dropped outside a droppable area
      if (!destination) return;

      // Dropped in the same place
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      // Find the task
      const taskId = draggableId;
      const newStatus = destination.droppableId;

      // Update task status
      updateTask.mutate({
        id: taskId,
        updates: { status: newStatus },
      });
    },
    [updateTask]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 animate-pulse rounded-md mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const columns = {
    todo: filteredTasks.todo || [],
    in_progress: filteredTasks.in_progress || [],
    completed: filteredTasks.completed || [],
    postponed: filteredTasks.postponed || []
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KanbanColumn
          title="Yapılacak"
          tasks={columns.todo}
          id="todo"
          onSelectTask={onSelectTask}
        />
        <KanbanColumn
          title="Devam Ediyor"
          tasks={columns.in_progress}
          id="in_progress"
          onSelectTask={onSelectTask}
        />
        <KanbanColumn
          title="Tamamlandı"
          tasks={columns.completed}
          id="completed"
          onSelectTask={onSelectTask}
        />
        <KanbanColumn
          title="Ertelendi"
          tasks={columns.postponed}
          id="postponed"
          onSelectTask={onSelectTask}
        />
      </div>
    </DragDropContext>
  );
};

export default TasksKanban;
