
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TasksPageHeaderProps {
  onCreateTask: () => void;
}

const TasksPageHeader = ({ onCreateTask }: TasksPageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Görevler</h1>
        <p className="text-sm text-muted-foreground">
          Tüm görevlerinizi yönetin ve takip edin
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Yeni Görev</span>
        </Button>
      </div>
    </div>
  );
};

export default TasksPageHeader;
