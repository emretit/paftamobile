
import { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import TasksContent from "@/components/tasks/TasksContent";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import TaskForm from "@/components/tasks/TaskForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TasksKanban from "@/components/tasks/TasksKanban";
import TasksPageHeader from "@/components/tasks/header/TasksPageHeader";

interface TasksPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks = ({ isCollapsed, setIsCollapsed }: TasksPageProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [activeView, setActiveView] = useState("list");
  
  const queryClient = useQueryClient();

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

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Görev ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tüm çalışanlar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm çalışanlar</SelectItem>
                {/* Employee options would be added here */}
              </SelectContent>
            </Select>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tüm görev tipleri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm görev tipleri</SelectItem>
                <SelectItem value="general">Genel</SelectItem>
                <SelectItem value="opportunity">Fırsat</SelectItem>
                <SelectItem value="proposal">Teklif</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
                <SelectItem value="call">Arama</SelectItem>
                <SelectItem value="meeting">Toplantı</SelectItem>
                <SelectItem value="follow_up">Takip</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className="w-fit"
          >
            <TabsList>
              <TabsTrigger value="list">Liste</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs
          value={activeView}
          className="w-full"
        >
          <TabsContent value="list" className="mt-0">
            <TasksContent 
              searchQuery={searchQuery}
              selectedEmployee={selectedEmployee}
              selectedType={selectedType}
            />
          </TabsContent>
          <TabsContent value="kanban" className="mt-0">
            <TasksKanban 
              searchQuery={searchQuery}
              selectedEmployee={selectedEmployee}
              selectedType={selectedType}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <TaskForm onClose={handleDialogClose} />
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
};

export default Tasks;
