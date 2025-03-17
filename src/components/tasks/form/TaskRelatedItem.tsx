
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FormData } from "./types";

interface TaskRelatedItemProps {
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

const TaskRelatedItem = ({ watch, setValue }: TaskRelatedItemProps) => {
  const { data: relatedItems } = useQuery({
    queryKey: ['related-items'],
    queryFn: async () => {
      const [opportunities, proposals] = await Promise.all([
        supabase.from('deals').select('id, title'),
        supabase.from('proposals').select('id, title')
      ]);
      return {
        opportunities: opportunities.data || [],
        proposals: proposals.data || []
      };
    }
  });

  // Early return if the task type is not one that relates to other entities
  if (watch("type") === "general" || 
      watch("type") === "meeting" || 
      watch("type") === "follow_up" || 
      watch("type") === "call" || 
      watch("type") === "email") {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>İlişkili Öğe</Label>
      <Select
        value={watch("related_item_id") || ""}
        onValueChange={(value) => {
          const [type, id] = value.split(':');
          let title = "";
          if (type === "opportunity") {
            title = relatedItems?.opportunities.find(o => o.id === id)?.title || "";
          } else if (type === "proposal") {
            title = relatedItems?.proposals.find(p => p.id === id)?.title || "";
          }
          setValue("related_item_id", id);
          setValue("related_item_title", title);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="İlişkili öğe seçin" />
        </SelectTrigger>
        <SelectContent>
          {watch("type") === "opportunity" && relatedItems?.opportunities.map((opp) => (
            <SelectItem key={opp.id} value={`opportunity:${opp.id}`}>
              {opp.title}
            </SelectItem>
          ))}
          {watch("type") === "proposal" && relatedItems?.proposals.map((prop) => (
            <SelectItem key={prop.id} value={`proposal:${prop.id}`}>
              {prop.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskRelatedItem;
