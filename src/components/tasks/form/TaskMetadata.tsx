
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { TaskPriority, TaskType } from "@/types/task";

interface FormValues {
  title: string;
  description: string;
  status: string;
  priority: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: Date;
  related_item_id?: string;
  related_item_type?: string;
  related_item_title?: string;
}

interface TaskMetadataProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

const TaskMetadata = ({ watch, setValue }: TaskMetadataProps) => {
  return (
    <div className="grid gap-2">
      <Label>Öncelik</Label>
      <Select 
        value={watch("priority")} 
        onValueChange={(value) => setValue("priority", value as TaskPriority)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Öncelik seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Düşük</SelectItem>
          <SelectItem value="medium">Orta</SelectItem>
          <SelectItem value="high">Yüksek</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskMetadata;
