
import { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TaskType } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";

interface TaskRelatedItemProps {
  form: UseFormReturn<any>;
  taskType: TaskType;
  defaultRelatedItemId?: string;
  defaultRelatedItemTitle?: string;
}

interface RelatedItem {
  id: string;
  title: string;
}

const TaskRelatedItem = ({ 
  form, 
  taskType,
  defaultRelatedItemId,
  defaultRelatedItemTitle 
}: TaskRelatedItemProps) => {
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(false);

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
      <FormField
        control={form.control}
        name="related_item_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{getRelatedItemLabel()}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // If selection changes, update the title too
                if (value) {
                  const selectedItem = relatedItems.find(item => item.id === value);
                  if (selectedItem) {
                    form.setValue('related_item_title', selectedItem.title);
                  }
                } else {
                  form.setValue('related_item_title', undefined);
                }
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`${getRelatedItemLabel()} seçin`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
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
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Hidden field to store the related item title */}
      <input 
        type="hidden" 
        {...form.register('related_item_title')} 
      />
    </div>
  );
};

export default TaskRelatedItem;
