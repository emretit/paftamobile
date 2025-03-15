
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TasksContent from "@/components/tasks/TasksContent";
import TasksPageHeader from "@/components/tasks/header/TasksPageHeader";
import TaskDetails from "@/components/tasks/detail/TaskDetails";
import { Task } from "@/types/task";
import TasksKanban from "@/components/tasks/TasksKanban";
import TasksFilterBar from "@/components/tasks/filters/TasksFilterBar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TasksPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks = ({ isCollapsed, setIsCollapsed }: TasksPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"table" | "kanban">("table");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch employees for filter dropdown
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("status", "aktif");
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleAddTask = () => {
    // In a future implementation, we could handle task creation here
    console.log("Add task clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-8">
          <TasksPageHeader 
            onAddTask={handleAddTask} 
            activeView={viewType} 
            setActiveView={setViewType} 
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
          
          {viewType === "table" ? (
            <TasksContent 
              searchQuery={searchQuery}
              selectedEmployee={selectedEmployee}
              selectedType={selectedType}
              onSelectTask={handleSelectTask}
            />
          ) : (
            <TasksKanban
              searchQuery={searchQuery}
              selectedEmployee={selectedEmployee}
              selectedType={selectedType}
              onSelectTask={handleSelectTask}
            />
          )}

          <TaskDetails 
            task={selectedTask} 
            isOpen={isDetailOpen} 
            onClose={() => setIsDetailOpen(false)} 
          />
        </div>
      </main>
    </div>
  );
};

export default Tasks;
