
import { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import TasksContent from "@/components/tasks/TasksContent";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksKanban from "@/components/tasks/TasksKanban";
import TasksPageHeader from "@/components/tasks/header/TasksPageHeader";
import TaskForm from "@/components/tasks/form/TaskForm";
import TasksFilterBar from "@/components/tasks/filters/TasksFilterBar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskStatus } from "@/types/task";

interface TasksPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks = ({ isCollapsed, setIsCollapsed }: TasksPageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [activeView, setActiveView] = useState("list");
  
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, position, department, status")
        .eq("status", "aktif");

      if (error) throw error;
      return data || [];
    }
  });

  const handleAddTask = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Refresh tasks data
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Görevler" 
      subtitle="Tüm görevleri yönetin"
    >
      <div className="space-y-6">
        <TasksPageHeader onCreateTask={handleAddTask} />

        <TasksFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedEmployee={selectedAssignee}
          setSelectedEmployee={setSelectedAssignee}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          employees={employees}
        />

        <Tabs
          value={activeView}
          onValueChange={setActiveView}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-0">
            <TasksContent 
              searchQuery={searchQuery}
              selectedEmployee={selectedAssignee}
              selectedType={selectedType}
              selectedStatus={selectedStatus}
            />
          </TabsContent>
          <TabsContent value="kanban" className="mt-0">
            <TasksKanban 
              searchQuery={searchQuery}
              selectedEmployee={selectedAssignee}
              selectedType={selectedType}
              selectedStatus={selectedStatus}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for creating/editing tasks */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <TaskForm 
            task={undefined} 
            onClose={handleDialogClose} 
          />
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
};

export default Tasks;
