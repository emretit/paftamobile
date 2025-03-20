
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { FormValues } from "./types";
import { UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";

interface TaskMetadataProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  errors?: FieldErrors<FormValues>;
}

const TaskMetadata = ({ watch, setValue, errors }: TaskMetadataProps) => {
  const priority = watch("priority");
  const dueDate = watch("due_date");

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="priority">Öncelik <span className="text-red-500">*</span></Label>
        <Select 
          value={priority} 
          onValueChange={(value) => setValue("priority", value as "low" | "medium" | "high")}
        >
          <SelectTrigger id="priority">
            <SelectValue placeholder="Öncelik seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Düşük</SelectItem>
            <SelectItem value="medium">Orta</SelectItem>
            <SelectItem value="high">Yüksek</SelectItem>
          </SelectContent>
        </Select>
        {errors?.priority && (
          <p className="text-sm text-red-500">{errors.priority.message}</p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="due_date">Son Tarih</Label>
        <DatePicker 
          selected={dueDate}
          onSelect={(date) => setValue("due_date", date)} 
          placeholder="Son tarih seçin"
        />
        {errors?.due_date && (
          <p className="text-sm text-red-500">{errors.due_date.message}</p>
        )}
      </div>
    </div>
  );
};

export default TaskMetadata;
