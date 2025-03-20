
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "./types";
import { UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";

interface TaskRelatedItemProps {
  taskType: string;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  errors?: FieldErrors<FormValues>;
}

const TaskRelatedItem = ({ 
  taskType, 
  watch, 
  setValue,
  errors 
}: TaskRelatedItemProps) => {
  const [relatedItems, setRelatedItems] = useState<{ id: string; title: string; }[]>([]);
  const relatedItemType = watch("related_item_type");
  const relatedItemId = watch("related_item_id");

  // Fetch opportunities
  const { data: opportunities, isLoading: isLoadingOpportunities } = useQuery({
    queryKey: ["opportunities-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id, title");
        
      if (error) throw error;
      return data || [];
    },
    enabled: taskType === "opportunity" || relatedItemType === "opportunity",
  });

  // Fetch proposals
  const { data: proposals, isLoading: isLoadingProposals } = useQuery({
    queryKey: ["proposals-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("id, title");
        
      if (error) throw error;
      return data || [];
    },
    enabled: taskType === "proposal" || relatedItemType === "proposal",
  });

  // Update related items when related item type changes
  useEffect(() => {
    if (relatedItemType === "opportunity" && opportunities) {
      setRelatedItems(opportunities);
    } else if (relatedItemType === "proposal" && proposals) {
      setRelatedItems(proposals);
    } else {
      setRelatedItems([]);
    }
  }, [relatedItemType, opportunities, proposals]);

  // Auto-set related item type based on task type if it's opportunity or proposal
  useEffect(() => {
    if ((taskType === "opportunity" || taskType === "proposal") && !relatedItemType) {
      setValue("related_item_type", taskType);
    }
  }, [taskType, relatedItemType, setValue]);

  // Update related_item_title when related_item_id changes
  useEffect(() => {
    if (relatedItemId && relatedItems.length > 0) {
      const selectedItem = relatedItems.find(item => item.id === relatedItemId);
      if (selectedItem) {
        setValue("related_item_title", selectedItem.title);
      }
    }
  }, [relatedItemId, relatedItems, setValue]);

  return (
    <div className="space-y-4 border p-4 rounded-md bg-gray-50">
      <h3 className="font-medium">İlgili Kayıt Bilgileri (Opsiyonel)</h3>
      
      <div className="grid gap-2">
        <Label htmlFor="related_item_type">İlgili Kayıt Türü</Label>
        <Select
          value={relatedItemType || ""}
          onValueChange={(value) => {
            setValue("related_item_type", value === "" ? undefined : value);
            setValue("related_item_id", undefined);  // Reset the related item id
            setValue("related_item_title", undefined);  // Reset the related item title
          }}
        >
          <SelectTrigger id="related_item_type">
            <SelectValue placeholder="İlgili kayıt türü seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Seçilmedi</SelectItem>
            <SelectItem value="opportunity">Fırsat</SelectItem>
            <SelectItem value="proposal">Teklif</SelectItem>
          </SelectContent>
        </Select>
        {errors?.related_item_type && (
          <p className="text-sm text-red-500">{errors.related_item_type.message}</p>
        )}
      </div>

      {relatedItemType && (
        <div className="grid gap-2">
          <Label htmlFor="related_item_id">
            İlgili {relatedItemType === "opportunity" ? "Fırsat" : "Teklif"}
          </Label>
          <Select
            value={relatedItemId || ""}
            onValueChange={(value) => 
              setValue("related_item_id", value === "" ? undefined : value)
            }
          >
            <SelectTrigger id="related_item_id">
              <SelectValue 
                placeholder={
                  (relatedItemType === "opportunity" && isLoadingOpportunities) || 
                  (relatedItemType === "proposal" && isLoadingProposals) 
                    ? "Yükleniyor..." 
                    : `İlgili ${relatedItemType === "opportunity" ? "fırsat" : "teklif"} seçin`
                } 
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Seçilmedi</SelectItem>
              {relatedItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.related_item_id && (
            <p className="text-sm text-red-500">{errors.related_item_id.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskRelatedItem;
