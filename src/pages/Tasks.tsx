
import { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import TasksContent from "@/components/tasks/TasksContent";
import { Task } from "@/types/task";

interface TasksProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks = ({ isCollapsed, setIsCollapsed }: TasksProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Görevler"
      subtitle="Tüm görevleri görüntüleyin ve yönetin"
    >
      <TasksContent 
        searchQuery={searchQuery}
        selectedEmployee={selectedEmployee}
        selectedType={selectedType}
        onSelectTask={handleSelectTask}
      />
    </DefaultLayout>
  );
};

export default Tasks;
