
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import TasksViewToggle from "./TasksViewToggle";

interface TasksPageHeaderProps {
  onAddTask: () => void;
  activeView: string;
  setActiveView: (view: any) => void;
}

const TasksPageHeader = ({ onAddTask, activeView, setActiveView }: TasksPageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Görevler</h1>
        <p className="text-gray-600 mt-1">Tüm görevleri görüntüleyin ve yönetin</p>
      </div>
      <div className="flex gap-3 items-center">
        <TasksViewToggle activeView={activeView} setActiveView={setActiveView} />
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtrele
        </Button>
        <Button size="sm" onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Görev Ekle
        </Button>
      </div>
    </div>
  );
};

export default TasksPageHeader;
