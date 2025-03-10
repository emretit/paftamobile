
import DefaultLayout from "@/components/layouts/DefaultLayout";
import TasksContent from "@/components/tasks/TasksContent";

interface TasksProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Tasks = ({ isCollapsed, setIsCollapsed }: TasksProps) => {
  return (
    <DefaultLayout 
      isCollapsed={isCollapsed} 
      setIsCollapsed={setIsCollapsed}
      title="Görevler"
      subtitle="Tüm görevleri görüntüleyin ve yönetin"
    >
      <TasksContent />
    </DefaultLayout>
  );
};

export default Tasks;
