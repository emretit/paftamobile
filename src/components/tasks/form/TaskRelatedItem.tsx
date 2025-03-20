
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { FormValues } from "./types";

interface TaskRelatedItemProps {
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

const TaskRelatedItem = ({ watch, setValue }: TaskRelatedItemProps) => {
  const relatedItemType = watch("related_item_type");
  const relatedItemId = watch("related_item_id");

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
    enabled: relatedItemType === "opportunity"
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
    enabled: relatedItemType === "proposal"
  });

  // Effect to reset related_item_id when related_item_type changes
  useEffect(() => {
    if (relatedItemType) {
      setValue("related_item_id", undefined);
      setValue("related_item_title", undefined);
    }
  }, [relatedItemType, setValue]);

  // Effect to set related_item_title when related_item_id changes
  useEffect(() => {
    if (relatedItemId && relatedItemType) {
      if (relatedItemType === "opportunity" && opportunities) {
        const opportunity = opportunities.find(opp => opp.id === relatedItemId);
        if (opportunity) {
          setValue("related_item_title", opportunity.title);
        }
      } else if (relatedItemType === "proposal" && proposals) {
        const proposal = proposals.find(prop => prop.id === relatedItemId);
        if (proposal) {
          setValue("related_item_title", proposal.title);
        }
      }
    }
  }, [relatedItemId, relatedItemType, opportunities, proposals, setValue]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="related_item_type">İlgili Kayıt Türü</Label>
        <Select
          value={relatedItemType || ""}
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
            value={relatedItemId || ""}
            onValueChange={(value) => 
              setValue("related_item_id", value === "" ? undefined : value)
            }
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

export default TaskRelatedItem;
