
import { Sheet, SheetContent } from "@/components/ui/sheet";
import TaskDetails from "./detail/TaskDetails";
import type { Task } from "@/types/task";

interface TaskDetailPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailPanel = ({ task, isOpen, onClose }: TaskDetailPanelProps) => {
  if (!task) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <TaskDetails task={task} onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailPanel;
