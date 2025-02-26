
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister } from "react-hook-form";
import type { FormData } from "./types";

interface TaskBasicInfoProps {
  register: UseFormRegister<FormData>;
}

const TaskBasicInfo = ({ register }: TaskBasicInfoProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          {...register("title", { required: true })}
          placeholder="Görev başlığını girin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Görev açıklamasını girin"
          className="min-h-[100px]"
        />
      </div>
    </>
  );
};

export default TaskBasicInfo;
