
import { useState, useEffect } from "react";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FormData } from "./types";

interface TaskRelatedItemProps {
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

const TaskRelatedItem = ({ watch, setValue }: TaskRelatedItemProps) => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [itemsAvailable, setItemsAvailable] = useState<{ id: string, title: string }[]>([]);
  
  const currentTaskType = watch("type");
  
  // Effect to reset when task type changes
  useEffect(() => {
    setValue("related_item_id", undefined);
    setValue("related_item_title", undefined);
    setSelectedSource(null);
    
    if (currentTaskType === "opportunity") {
      setSelectedSource("opportunities");
    } else if (currentTaskType === "proposal") {
      setSelectedSource("proposals");
    } else if (currentTaskType === "follow_up" || currentTaskType === "meeting") {
      setSelectedSource("customers");
    } else {
      setSelectedSource(null);
    }
  }, [currentTaskType, setValue]);
  
  // Fetch related items based on selected source
  const { data, isLoading } = useQuery({
    queryKey: ["relatedItems", selectedSource],
    queryFn: async () => {
      if (!selectedSource) return [];
      
      let query;
      if (selectedSource === "opportunities") {
        const { data, error } = await supabase
          .from('deals')  // Assuming 'deals' is the table name for opportunities
          .select('id, title');
        
        if (error) throw error;
        return data;
      } else if (selectedSource === "proposals") {
        const { data, error } = await supabase
          .from('proposals')
          .select('id, title');
        
        if (error) throw error;
        return data;
      } else if (selectedSource === "customers") {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name');
        
        if (error) throw error;
        return data.map(customer => ({
          id: customer.id,
          title: customer.name // Map customer name to title for consistent interface
        }));
      }
      
      return [];
    },
    enabled: !!selectedSource
  });
  
  useEffect(() => {
    if (data) {
      setItemsAvailable(data);
    }
  }, [data]);
  
  const handleRelatedItemChange = (id: string) => {
    setValue("related_item_id", id);
    const selectedItem = itemsAvailable.find(item => item.id === id);
    if (selectedItem) {
      setValue("related_item_title", selectedItem.title);
    }
  };
  
  if (!selectedSource) return null;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="related_item">İlgili {
        selectedSource === "opportunities" ? "Fırsat" : 
        selectedSource === "proposals" ? "Teklif" : 
        selectedSource === "customers" ? "Müşteri" : "Öğe"
      }</Label>
      <Select
        value={watch("related_item_id") || ""}
        onValueChange={handleRelatedItemChange}
      >
        <SelectTrigger id="related_item">
          <SelectValue placeholder={
            isLoading 
              ? "Yükleniyor..." 
              : `İlgili ${selectedSource === "opportunities" ? "fırsat" : 
                 selectedSource === "proposals" ? "teklif" : 
                 selectedSource === "customers" ? "müşteri" : "öğe"} seçin`
          } />
        </SelectTrigger>
        <SelectContent>
          {itemsAvailable.map(item => (
            <SelectItem key={item.id} value={item.id}>
              {item.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskRelatedItem;
