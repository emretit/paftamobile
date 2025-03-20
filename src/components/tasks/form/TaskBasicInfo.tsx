
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormValues } from "./types";

interface TaskBasicInfoProps {
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
}

const TaskBasicInfo = ({ register, errors }: TaskBasicInfoProps) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="title" className="flex items-center">
          Başlık <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Görev başlığı"
          className={errors.title ? "border-red-500 focus:ring-red-500" : ""}
          {...register("title", { required: "Başlık zorunludur" })}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description" className="flex items-center">
          Açıklama <span className="text-red-500 ml-1">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Görev açıklaması"
          rows={3}
          className={errors.description ? "border-red-500 focus:ring-red-500" : ""}
          {...register("description", { required: "Açıklama zorunludur" })}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="type" className="flex items-center">
          Görev Türü <span className="text-red-500 ml-1">*</span>
        </Label>
        <select 
          id="type"
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
          {...register("type")}
        >
          <option value="general">Genel</option>
          <option value="call">Arama</option>
          <option value="meeting">Toplantı</option>
          <option value="follow_up">Takip</option>
          <option value="proposal">Teklif</option>
          <option value="opportunity">Fırsat</option>
          <option value="reminder">Hatırlatıcı</option>
          <option value="email">E-posta</option>
        </select>
        {errors.type && (
          <p className="text-sm text-red-500">{errors.type.message}</p>
        )}
      </div>
    </>
  );
};

export default TaskBasicInfo;
