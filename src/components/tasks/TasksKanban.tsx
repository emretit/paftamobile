
import React from "react";
import { useTaskRealtime } from "./hooks/useTaskRealtime";
import { useKanbanTasks } from "./hooks/useKanbanTasks";
import LoadingState from "./kanban/LoadingState";
import ErrorState from "./kanban/ErrorState";
import EmptyState from "./kanban/EmptyState";
import TaskKanbanBoard from "./kanban/TaskKanbanBoard";
import type { Task } from "@/types/task";

interface TasksKanbanProps {
  searchQuery: string;
  selectedEmployee: string | null;
  selectedType: string | null;
  onEditTask?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
}

const TasksKanban = ({ 
  searchQuery, 
  selectedEmployee, 
  selectedType, 
  onEditTask, 
  onSelectTask 
}: TasksKanbanProps) => {
  // Use the shared realtime hook
  useTaskRealtime();
  
  // Use the tasks hook
  const {
    tasks,
    setTasks,
    isLoading,
    error,
    filterTasks,
    updateTaskMutation
  } = useKanbanTasks(searchQuery, selectedEmployee, selectedType);

  const handleUpdateTaskStatus = async (id: string, status: Task['status']) => {
    await updateTaskMutation.mutateAsync({ id, status });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!tasks.length) {
    return <EmptyState />;
  }

  return (
    <TaskKanbanBoard
      tasks={tasks}
      setTasks={setTasks}
      filterTasks={filterTasks}
      onUpdateTaskStatus={handleUpdateTaskStatus}
      onEditTask={onEditTask}
      onSelectTask={onSelectTask}
    />
  );
};

export default TasksKanban;
