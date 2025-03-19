
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskType } from "@/types/task";
import { FormValues } from "./types";

interface TaskRelatedItemProps {
  taskType: TaskType;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

const TaskRelatedItem = ({ taskType, watch, setValue }: TaskRelatedItemProps) => {
  const relatedItemType = watch("related_item_type");
  
  // Fetch opportunities for the related entity dropdown
  const { data: opportunities } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id, title");
      
      if (error) throw error;
      return data || [];
    },
    enabled: relatedItemType === "opportunity" || taskType === "opportunity"
  });

  // Fetch proposals for the related entity dropdown
  const { data: proposals } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("id, title");
      
      if (error) throw error;
      return data || [];
    },
    enabled: relatedItemType === "proposal" || taskType === "proposal"
  });
  
  // Automatically set related item type based on task type if relevant
  useEffect(() => {
    if (taskType === "opportunity" && !relatedItemType) {
      setValue("related_item_type", "opportunity");
    } else if (taskType === "proposal" && !relatedItemType) {
      setValue("related_item_type", "proposal");
    }
  }, [taskType, relatedItemType, setValue]);

  // If the task type isn't related to something else, don't show this section
  if (!["opportunity", "proposal", "follow_up"].includes(taskType) && !relatedItemType) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="related_item_type">İlgili Kayıt Türü</Label>
        <Select
          value={watch("related_item_type") || ""}
          onValueChange={(value) => 
            setValue("related_item_type", value === "" ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="İlgili kayıt türü seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Seçilmedi</SelectItem>
            <SelectItem value="opportunity">Fırsat</SelectItem>
            <SelectItem value="proposal">Teklif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {relatedItemType && (
        <div className="grid gap-2">
          <Label htmlFor="related_item_id">İlgili {relatedItemType === "opportunity" ? "Fırsat" : "Teklif"}</Label>
          <Select
            value={watch("related_item_id") || ""}
            onValueChange={(value) => {
              setValue("related_item_id", value === "" ? undefined : value);
              
              // Also set the title
              if (value && value !== "") {
                if (relatedItemType === "opportunity" && opportunities) {
                  const opportunity = opportunities.find(opp => opp.id === value);
                  if (opportunity) {
                    setValue("related_item_title", opportunity.title);
                  }
                } else if (relatedItemType === "proposal" && proposals) {
                  const proposal = proposals.find(prop => prop.id === value);
                  if (proposal) {
                    setValue("related_item_title", proposal.title);
                  }
                }
              } else {
                setValue("related_item_title", undefined);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={`İlgili ${relatedItemType === "opportunity" ? "fırsat" : "teklif"} seçin`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Seçilmedi</SelectItem>
              {relatedItemType === "opportunity" && opportunities?.map((opportunity) => (
                <SelectItem key={opportunity.id} value={opportunity.id}>
                  {opportunity.title}
                </SelectItem>
              ))}
              {relatedItemType === "proposal" && proposals?.map((proposal) => (
                <SelectItem key={proposal.id} value={proposal.id}>
                  {proposal.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

import { useEffect } from "react";

export default TaskRelatedItem;
