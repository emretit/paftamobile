
import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus, TaskType } from "@/types/task";
import { useKanbanTasks } from "./hooks/useKanbanTasks";
import { useTaskMutations } from "./hooks/useTaskMutations";
import KanbanColumn from "./KanbanColumn";
import TaskForm from "./TaskForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ListTodo, Clock, CheckCircle2, Hourglass } from "lucide-react";

interface TasksKanbanProps {
  searchQuery?: string;
  selectedEmployee?: string | null;
  selectedType?: string | null;
  selectedStatus?: TaskStatus | null;
  onSelectTask?: (task: Task) => void;
}

const columns = [
  { id: "todo", title: "Yapılacak", icon: ListTodo, color: "bg-blue-600" },
  { id: "in_progress", title: "Devam Ediyor", icon: Clock, color: "bg-purple-600" },
  { id: "completed", title: "Tamamlandı", icon: CheckCircle2, color: "bg-green-600" },
  { id: "postponed", title: "Ertelendi", icon: Hourglass, color: "bg-amber-600" }
];

export const TasksKanban = ({ 
  searchQuery, 
  selectedEmployee, 
  selectedType,
  selectedStatus,
  onSelectTask
}: TasksKanbanProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Convert selectedType to TaskType or null
  const typedSelectedType = selectedType as TaskType | null;
  
  const { tasks, setTasksState, isLoading, error } = useKanbanTasks({
    searchQuery,
    selectedEmployee,
    selectedType: selectedType,
    selectedStatus
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
      await updateTask.mutateAsync({
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

  // Helper function to add isOverdue property to tasks
  const addIsOverdueProp = (tasksArr: Task[]) => {
    return tasksArr.map(task => ({
      ...task,
      isOverdue: task.due_date ? new Date(task.due_date) < new Date() : false
    }));
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {columns.map((column) => (
            <div key={column.id} className="flex-none min-w-[300px]">
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-3 w-3 rounded-full ${column.color}`}></div>
                <h2 className="font-semibold text-gray-900">
                  {column.title} ({tasks[column.id as keyof typeof tasks]?.length || 0})
                </h2>
              </div>
              <KanbanColumn
                id={column.id}
                title={column.title}
                tasks={addIsOverdueProp(tasks[column.id as keyof typeof tasks])}
                onTaskEdit={handleTaskEdit}
                onTaskSelect={onSelectTask}
              />
            </div>
          ))}
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
