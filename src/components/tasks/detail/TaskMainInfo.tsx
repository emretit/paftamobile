
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/types/task";

interface TaskMainInfoProps {
  task: Task;
  onUpdate: (field: keyof Task, value: any) => void;
}

export const TaskMainInfo = ({ task, onUpdate }: TaskMainInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <Input
          value={task.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Görev başlığı"
          className="text-lg font-medium"
        />
      </div>

      <div className="space-y-2">
        <Textarea
          value={task.description || ""}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="Görev açıklaması"
          className="min-h-[100px]"
        />
      </div>
    </>
  );
};
