
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "@/types/task";

interface TaskMainInfoProps {
  formData: Task;
  handleInputChange: (key: keyof Task, value: any) => void;
}

const TaskMainInfo = ({ formData, handleInputChange }: TaskMainInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Görev Adı</label>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Görev adını girin"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Açıklama</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Görev açıklamasını girin"
          className="min-h-32"
        />
      </div>
    </>
  );
};

export default TaskMainInfo;
