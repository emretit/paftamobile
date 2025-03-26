
import { ProposalFormData } from "@/types/proposal-form";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ProposalItem, ProposalStatus } from "@/types/proposal";

export type { ProposalFormData };

export const useProposalFormState = (initialProposal = null, isNew = true, onSaveCallback?: (data: any) => Promise<void>) => {
  const [formData, setFormData] = useState<ProposalFormData>({
    title: "",
    status: "draft" as ProposalStatus,
    currency: "TRY",
    items: []
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsFormDirty(true);
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: date ? date.toISOString() : undefined 
    }));
    setIsFormDirty(true);
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleItemsChange = (items: ProposalItem[]) => {
    setFormData(prev => ({ ...prev, items }));
    setIsFormDirty(true);
  };

  const handleCurrencyChange = (currency: string) => {
    setFormData(prev => ({ ...prev, currency }));
    setIsFormDirty(true);
  };

  const addItem = () => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 18,
      total_price: 0,
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
    setIsFormDirty(true);
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== id) || []
    }));
    setIsFormDirty(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      errors.title = "Teklif başlığı gereklidir";
    }
    
    if (!formData.customer_id) {
      errors.customer_id = "Müşteri seçimi gereklidir";
    }
    
    if (!formData.valid_until) {
      errors.valid_until = "Geçerlilik tarihi gereklidir";
    }
    
    if (!formData.items || formData.items.length === 0) {
      errors.items = "En az bir teklif kalemi eklenmelidir";
    } else {
      // Check if all items have names
      const hasEmptyItems = formData.items.some(item => !item.name?.trim());
      if (hasEmptyItems) {
        errors.items = "Tüm kalemlerin isimleri doldurulmalıdır";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    if (onSaveCallback) {
      try {
        setSaving(true);
        await onSaveCallback(formData);
        setIsFormDirty(false);
      } catch (error) {
        console.error("Error saving form:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      status: "draft" as ProposalStatus,
      currency: "TRY",
      items: []
    });
    setFormErrors({});
    setIsFormDirty(false);
  };

  return {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    isFormDirty,
    saving,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleItemsChange,
    handleCurrencyChange,
    handleSave,
    addItem,
    removeItem,
    validateForm,
    resetForm
  };
};
