
import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus, TaskType } from "@/types/task";
import { useKanbanTasks } from "./hooks/useKanbanTasks";
import { useTaskMutations } from "./hooks/useTaskMutations";
import KanbanColumn from "./KanbanColumn";
import TaskForm from "./TaskForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface TasksKanbanProps {
  searchQuery?: string;
  selectedEmployee?: string | null;
  selectedType?: string | null;
  onSelectTask?: (task: Task) => void;
}

export const TasksKanban = ({ 
  searchQuery, 
  selectedEmployee, 
  selectedType,
  onSelectTask
}: TasksKanbanProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Convert selectedType to TaskType or null
  const typedSelectedType = selectedType as TaskType | null;
  
  const { tasks, setTasksState, isLoading, error } = useKanbanTasks({
    searchQuery,
    selectedEmployee,
    selectedType: typedSelectedType
  });
  
  const { updateTask } = useTaskMutations();

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    // Find the task that was dragged
    const status = source.droppableId as TaskStatus;
    const targetStatus = destination.droppableId as TaskStatus;
    const taskIndex = tasks[status].findIndex(t => t.id === draggableId);
    
    if (taskIndex === -1) return;
    
    const task = tasks[status][taskIndex];

    // Update task status in local state
    const newTasksState = { ...tasks };
    newTasksState[status] = newTasksState[status].filter(t => t.id !== task.id);
    const updatedTask = { ...task, status: targetStatus };
    newTasksState[targetStatus] = [
      ...newTasksState[targetStatus].slice(0, destination.index),
      updatedTask,
      ...newTasksState[targetStatus].slice(destination.index)
    ];
    
    setTasksState(newTasksState);

    // Update task status in database
    try {
      await updateTask({
        id: task.id,
        status: targetStatus
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      // Revert to original state on error
      setTasksState(tasks);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setSelectedTask(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Görevler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Görevler yüklenirken bir hata oluştu.</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KanbanColumn
            id="todo"
            title="Yapılacak"
            tasks={tasks.todo}
            onTaskEdit={handleTaskEdit}
            onTaskSelect={onSelectTask}
          />
          <KanbanColumn
            id="in_progress"
            title="Devam Ediyor"
            tasks={tasks.in_progress}
            onTaskEdit={handleTaskEdit}
            onTaskSelect={onSelectTask}
          />
          <KanbanColumn
            id="completed"
            title="Tamamlandı"
            tasks={tasks.completed}
            onTaskEdit={handleTaskEdit}
            onTaskSelect={onSelectTask}
          />
          <KanbanColumn
            id="postponed"
            title="Ertelendi"
            tasks={tasks.postponed}
            onTaskEdit={handleTaskEdit}
            onTaskSelect={onSelectTask}
          />
        </div>
      </DragDropContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <TaskForm task={selectedTask || undefined} onClose={handleDialogClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksKanban;
