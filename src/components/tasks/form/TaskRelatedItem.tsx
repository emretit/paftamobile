
import { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TaskType } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";

interface TaskRelatedItemProps {
  form: UseFormReturn<any>;
  taskType: TaskType | string;
  defaultRelatedItemId?: string;
  defaultRelatedItemTitle?: string;
}

const TaskRelatedItem = ({
  form,
  taskType,
  defaultRelatedItemId,
  defaultRelatedItemTitle,
}: TaskRelatedItemProps) => {
  const [relatedItems, setRelatedItems] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      if (!taskType || taskType === "general" || taskType === "email" || 
          taskType === "call" || taskType === "meeting" || taskType === "follow_up") {
        setRelatedItems([]);
        return;
      }

      setLoading(true);
      try {
        let data;
        if (taskType === "opportunity") {
          const { data: opportunitiesData, error } = await supabase
            .from("opportunities")
            .select("id, title")
            .order("created_at", { ascending: false });
          
          if (error) throw error;
          data = opportunitiesData;
        } else if (taskType === "proposal") {
          const { data: proposalsData, error } = await supabase
            .from("proposals")
            .select("id, title")
            .order("created_at", { ascending: false });
          
          if (error) throw error;
          data = proposalsData;
        }
        
        setRelatedItems(data || []);
      } catch (error) {
        console.error(`Error fetching ${taskType} items:`, error);
        setRelatedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedItems();
  }, [taskType]);

  // If the task type doesn't require a related item, don't render the select
  if (!taskType || 
      taskType === "general" || 
      taskType === "email" || 
      taskType === "call" || 
      taskType === "meeting" || 
      taskType === "follow_up") {
    return null;
  }

  let typeLabel = "";
  switch (taskType) {
    case "opportunity":
      typeLabel = "Fırsat";
      break;
    case "proposal":
      typeLabel = "Teklif";
      break;
    default:
      typeLabel = "İlgili Öğe";
  }

  return (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name="related_item_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>İlgili {typeLabel}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Also set the title when ID changes
                const selectedItem = relatedItems.find((item) => item.id === value);
                if (selectedItem) {
                  form.setValue("related_item_title", selectedItem.title);
                }
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`${typeLabel} seçin`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                ) : relatedItems.length > 0 ? (
                  relatedItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>Kayıt bulunamadı</SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskRelatedItem;
