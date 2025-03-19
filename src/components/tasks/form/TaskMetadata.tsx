
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { TaskPriority, TaskType } from "@/types/task";
import { FormValues } from "./types";

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
