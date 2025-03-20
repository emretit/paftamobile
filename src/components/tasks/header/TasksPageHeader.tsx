
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface TasksPageHeaderProps {
  onCreateTask: () => void;
}

const TasksPageHeader = ({ onCreateTask }: TasksPageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Görevler</h1>
        <p className="text-muted-foreground">
          Tüm görevleri görüntüleyin, düzenleyin ve yönetin
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/tasks/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Görev Ekle
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TasksPageHeader;
