
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface FormValues {
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  assignee_id?: string;
  due_date?: Date;
  related_item_id?: string;
  related_item_type?: string;
  related_item_title?: string;
}

interface TaskBasicInfoProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

const TaskBasicInfo = ({ register, errors }: TaskBasicInfoProps) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="title">Başlık <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          placeholder="Görev başlığı"
          {...register("title", { required: "Başlık zorunludur" })}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Açıklama <span className="text-red-500">*</span></Label>
        <Textarea
          id="description"
          placeholder="Görev açıklaması"
          rows={3}
          {...register("description", { required: "Açıklama zorunludur" })}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
    </>
  );
};

export default TaskBasicInfo;
