
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import type { FormData } from "./types";
import type { Task } from "@/types/task";

interface TaskMetadataProps {
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

const TaskMetadata = ({ watch, setValue }: TaskMetadataProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Öncelik</Label>
        <Select
          value={watch("priority")}
          onValueChange={(value) => setValue("priority", value as Task["priority"])}
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

      <div className="space-y-2">
        <Label>Tip</Label>
        <Select
          value={watch("type")}
          onValueChange={(value) => setValue("type", value as Task["type"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Görev tipi seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">Genel</SelectItem>
            <SelectItem value="opportunity">Fırsat</SelectItem>
            <SelectItem value="proposal">Teklif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskMetadata;
