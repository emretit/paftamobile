import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import TasksFilterBar from "./filters/TasksFilterBar";
import TasksViewToggle, { ViewType } from "./header/TasksViewToggle";
import TasksPageHeader from "./header/TasksPageHeader";
import TasksKanban from "./TasksKanban";
import TasksTable from "./TasksTable";
import TasksCalendar from "./TasksCalendar";
import TaskForm from "./TaskForm";
import TaskDetailPanel from "./TaskDetailPanel";
import type { Task } from "@/types/task";

const TasksContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("kanban");

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailPanelOpen(true);
  };

  const handleAddNewTask = () => {
    setTaskToEdit(null);
    setIsTaskFormOpen(true);
  };

  const getViewComponent = () => {
    switch (activeView) {
      case "table":
        return (
          <TasksTable
            searchQuery={searchQuery}
            selectedEmployee={selectedEmployee}
            selectedType={selectedType}
            onSelectTask={handleSelectTask}
          />
        );
      case "calendar":
        return (
          <TasksCalendar
            searchQuery={searchQuery}
            selectedEmployee={selectedEmployee}
            selectedType={selectedType}
            onEditTask={handleEditTask}
            onSelectTask={handleSelectTask}
          />
        );
      case "kanban":
      default:
        return (
          <TasksKanban
            searchQuery={searchQuery}
            selectedEmployee={selectedEmployee}
            selectedType={selectedType}
            onEditTask={handleEditTask}
            onSelectTask={handleSelectTask}
          />
        );
    }
  };

  return (
    <div className="p-6">
      <TasksPageHeader
        onAddTask={handleAddNewTask}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <TasksFilterBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        employees={employees}
      />

      <ScrollArea className={`h-[calc(100vh-280px)] ${activeView === "calendar" ? "pr-4" : ""}`}>
        {getViewComponent()}
      </ScrollArea>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      <TaskDetailPanel
        task={selectedTask}
        isOpen={isDetailPanelOpen}
        onClose={() => {
          setIsDetailPanelOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};

export default TasksContent;
