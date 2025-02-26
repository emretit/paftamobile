
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus } from "lucide-react";
import TasksKanban from "@/components/tasks/TasksKanban";
import TaskForm from "@/components/tasks/TaskForm";
import TaskDetailSheet from "@/components/tasks/TaskDetailSheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "@/types/task";

interface TasksProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks = ({ isCollapsed, setIsCollapsed }: TasksProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${
        isCollapsed ? 'ml-[60px]' : 'ml-64'
      }`}>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Görevler</h1>
              <p className="text-gray-600 mt-1">Tüm görevleri görüntüleyin ve yönetin</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrele
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Görev Ekle
              </Button>
            </div>
          </div>

          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Görev ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select
                value={selectedEmployee || "all"}
                onValueChange={(value) => setSelectedEmployee(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Çalışan seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {employees?.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedType || "all"}
                onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Görev tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="opportunity">Fırsat</SelectItem>
                  <SelectItem value="proposal">Teklif</SelectItem>
                  <SelectItem value="general">Genel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <ScrollArea className="h-[calc(100vh-280px)]">
            <TasksKanban
              searchQuery={searchQuery}
              selectedEmployee={selectedEmployee}
              selectedType={selectedType}
              onEditTask={handleEditTask}
              onSelectTask={handleSelectTask}
            />
          </ScrollArea>
        </div>

        <TaskForm
          isOpen={isTaskFormOpen}
          onClose={() => {
            setIsTaskFormOpen(false);
            setTaskToEdit(null);
          }}
          taskToEdit={taskToEdit}
        />

        <TaskDetailSheet
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      </main>
    </div>
  );
};

export default Tasks;
