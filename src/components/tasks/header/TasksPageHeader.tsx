
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TasksViewToggle from "./TasksViewToggle";

interface TasksPageHeaderProps {
  onCreateTask: () => void;
}

const TasksPageHeader = ({ onCreateTask }: TasksPageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold">Görevler</h1>
        <p className="text-muted-foreground">Tüm görevleri görüntüleyin ve yönetin</p>
      </div>
      <div className="flex space-x-2 w-full sm:w-auto justify-end">
        <TasksViewToggle />
        <Button onClick={onCreateTask} className="whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Görev Ekle
        </Button>
      </div>
    </div>
  );
};

export default TasksPageHeader;
