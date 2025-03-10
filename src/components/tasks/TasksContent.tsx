
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Görevler</h1>
          <p className="text-gray-600 mt-1">Tüm görevleri görüntüleyin ve yönetin</p>
        </div>
        <div className="flex gap-3 items-center">
          <TasksViewToggle 
            activeView={activeView} 
            setActiveView={setActiveView} 
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrele
          </Button>
          <Button 
            size="sm"
            onClick={handleAddNewTask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Görev Ekle
          </Button>
        </div>
      </div>

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
