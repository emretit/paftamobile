import { useTaskRealtime } from "./hooks/useTaskRealtime";
import { useTaskCalendar } from "./hooks/useTaskCalendar";
import { TaskCalendarView } from "./calendar/TaskCalendarView";
import TaskQuickView from "./calendar/TaskQuickView";
import type { Task } from "@/types/task";

interface TasksCalendarProps {
  searchQuery: string;
  selectedEmployee: string | null;
  selectedType: string | null;
  onEditTask?: (task: Task) => void;
  onSelectTask?: (task: Task) => void;
}

const TasksCalendar = ({
  searchQuery,
  selectedEmployee,
  selectedType,
  onEditTask,
  onSelectTask
}: TasksCalendarProps) => {
  // Use the shared realtime hook
  useTaskRealtime();
  
  // Use the task calendar hook
  const {
    events,
    isLoading,
    error,
    selectedEvent,
    isQuickViewOpen,
    setIsQuickViewOpen,
    handleEventUpdate,
    handleSelectEvent,
    deleteTaskMutation
  } = useTaskCalendar(searchQuery, selectedEmployee, selectedType);

  const handleViewTask = () => {
    if (selectedEvent && onSelectTask) {
      onSelectTask(selectedEvent.resource);
      setIsQuickViewOpen(false);
    }
  };

  const handleEditTask = () => {
    if (selectedEvent && onEditTask) {
      onEditTask(selectedEvent.resource);
      setIsQuickViewOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-red-500">Error loading tasks: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border p-4">
      <TaskCalendarView
        events={events}
        onEventUpdate={handleEventUpdate}
        onSelectEvent={handleSelectEvent}
      />

      <TaskQuickView
        isOpen={isQuickViewOpen}
        onOpenChange={setIsQuickViewOpen}
        selectedEvent={selectedEvent}
        onViewTask={handleViewTask}
        onEditTask={handleEditTask}
        onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
      />
    </div>
  );
};

export default TasksCalendar;
