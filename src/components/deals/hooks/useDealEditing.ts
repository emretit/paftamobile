
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Deal } from "@/types/deal";

export const useDealEditing = (initialDeal: Deal) => {
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Deal>(initialDeal);

  const handleEdit = (field: keyof Deal) => {
    setEditingFields(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof Deal, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field: keyof Deal) => {
    try {
      const value = editValues[field];
      if (value === undefined) return;

      const { error } = await supabase
        .from('deals')
        .update({ [field]: value })
        .eq('id', initialDeal.id);

      if (error) throw error;

      setEditingFields(prev => ({ ...prev, [field]: false }));
      toast.success('Değişiklikler kaydedildi');
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Değişiklikler kaydedilirken bir hata oluştu');
    }
  };

  return {
    editingFields,
    editValues,
    handleEdit,
    handleChange,
    handleSave
  };
};
