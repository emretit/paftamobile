
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTaskDetail } from "./hooks/useTaskDetail";
import { TaskMainInfo } from "./detail/TaskMainInfo";
import { TaskMetadata } from "./detail/TaskMetadata";
import { SubtaskManager } from "./detail/SubtaskManager";
import type { Task } from "@/types/task";

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSheet = ({ task, isOpen, onClose }: TaskDetailSheetProps) => {
  const {
    formData,
    employees,
    handleChange
  } = useTaskDetail(task);

  if (!formData) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-left">Görev Detayları</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <TaskMainInfo 
            task={formData} 
            onUpdate={handleChange} 
          />
          
          <TaskMetadata 
            task={formData} 
            employees={employees} 
            onUpdate={handleChange} 
          />

          <SubtaskManager 
            task={formData} 
            onUpdate={handleChange} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailSheet;
