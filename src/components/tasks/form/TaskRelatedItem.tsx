
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { TaskType } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";

interface RelatedItem {
  id: string;
  title: string;
}

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

interface TaskRelatedItemProps {
  taskType: TaskType;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
}

const TaskRelatedItem = ({ taskType, watch, setValue }: TaskRelatedItemProps) => {
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const relatedItemType = watch("related_item_type");

  useEffect(() => {
    // Only fetch related items if we have a specific type
    if (!taskType || taskType === 'general') {
      setRelatedItems([]);
      return;
    }

    const fetchRelatedItems = async () => {
      setLoading(true);
      try {
        let data = null;
        let error = null;

        // Fetch different related items based on task type
        switch (taskType) {
          case 'opportunity':
            // Fetch opportunities
            ({ data, error } = await supabase
              .from('opportunities')
              .select('id, title')
              .order('created_at', { ascending: false }));
            break;
          case 'proposal':
            // Fetch proposals
            ({ data, error } = await supabase
              .from('proposals')
              .select('id, title')
              .order('created_at', { ascending: false }));
            break;
          // Add other cases for email, call, meeting, etc.
          default:
            // For other types, just clear the list
            setRelatedItems([]);
            setLoading(false);
            return;
        }

        if (error) throw error;
        setRelatedItems(data || []);
      } catch (error) {
        console.error(`Error fetching ${taskType} items:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedItems();
  }, [taskType]);

  // Effect to set related_item_title when related_item_id changes
  useEffect(() => {
    const relatedItemId = watch("related_item_id");
    if (relatedItemId && relatedItems.length > 0) {
      const item = relatedItems.find(item => item.id === relatedItemId);
      if (item) {
        setValue("related_item_title", item.title);
      }
    }
  }, [watch("related_item_id"), relatedItems, setValue]);

  // Only show related item field for certain task types
  if (!taskType || taskType === 'general') {
    return null;
  }

  const getRelatedItemLabel = () => {
    switch (taskType) {
      case 'opportunity':
        return 'İlgili Fırsat';
      case 'proposal':
        return 'İlgili Teklif';
      case 'call':
        return 'İlgili Arama';
      case 'email':
        return 'İlgili E-posta';
      case 'meeting':
        return 'İlgili Toplantı';
      case 'follow_up':
        return 'İlgili Takip';
      default:
        return 'İlgili Öğe';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>İlgili Kayıt Türü</Label>
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
          <Label>İlgili {relatedItemType === "opportunity" ? "Fırsat" : "Teklif"}</Label>
          <Select
            value={watch("related_item_id") || ""}
            onValueChange={(value) => 
              setValue("related_item_id", value === "" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`İlgili ${relatedItemType === "opportunity" ? "fırsat" : "teklif"} seçin`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Seçilmedi</SelectItem>
              {loading ? (
                <SelectItem value="" disabled>Yükleniyor...</SelectItem>
              ) : relatedItems.length === 0 ? (
                <SelectItem value="" disabled>İlgili öğe bulunamadı</SelectItem>
              ) : (
                relatedItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default TaskRelatedItem;
