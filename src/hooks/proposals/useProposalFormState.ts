
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProposalFormData } from "@/types/proposal-form";
import { ProposalStatus, Proposal } from "@/types/proposal";
import { useProposalDraft } from "./useProposalDraft";
import { useProposalCreation } from "./useProposalCreation";
import { useProposalCalculations } from "./useProposalCalculations";
import { useTechnicianNames } from "@/components/service/hooks/useTechnicianNames";
import { useAuthState } from "@/components/navbar/useAuthState";

export const useProposalFormState = (
  initialProposal: Proposal | null,
  isNew: boolean,
  onSave: (formData: any) => Promise<void>
) => {
  // Form state
  const [formData, setFormData] = useState<ProposalFormData>({
    title: "",
    description: "",
    valid_until: "",
    payment_terms: "",
    delivery_terms: "",
    notes: "",
    status: "draft" as ProposalStatus,
    customer_id: "",
    employee_id: "",
    items: [],
    currency: "TRY" // Varsayılan para birimi
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { user } = useAuthState();
  const { employees } = useTechnicianNames();
  const { saveDraft, isLoading: isSavingDraft } = useProposalDraft();
  const { createProposal, isLoading: isCreating } = useProposalCreation();
  const { calculateTotals } = useProposalCalculations();

  // Initialize form with proposal data if editing
  useEffect(() => {
    if (initialProposal && !isNew) {
      setFormData({
        title: initialProposal.title || "",
        description: initialProposal.description || "",
        valid_until: initialProposal.valid_until || "",
        payment_terms: initialProposal.payment_terms || "",
        delivery_terms: initialProposal.delivery_terms || "",
        notes: initialProposal.notes || "",
        status: initialProposal.status,
        customer_id: initialProposal.customer_id || "",
        employee_id: initialProposal.employee_id || "",
        items: initialProposal.items || [],
        currency: initialProposal.currency || "TRY" // Mevcut teklifteki para birimi
      });
    } else if (isNew) {
      if (user) {
        const currentUserAsEmployee = employees.find(
          emp => user && emp.first_name && emp.last_name && 
          (user.user_metadata?.full_name?.includes(emp.first_name) || 
          user.user_metadata?.full_name?.includes(emp.last_name))
        );
        
        if (currentUserAsEmployee) {
          setFormData(prev => ({
            ...prev,
            employee_id: currentUserAsEmployee.id
          }));
        }
      }
    }
  }, [initialProposal, isNew, employees, user]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Teklif başlığı gereklidir";
    }
    
    if (!formData.valid_until) {
      errors.valid_until = "Geçerlilik tarihi gereklidir";
    }
    
    if (!formData.currency) {
      errors.currency = "Para birimi seçilmelidir";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsFormDirty(true);
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsFormDirty(true);
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        valid_until: date.toISOString()
      }));
      setIsFormDirty(true);
      
      // Clear error when field is edited
      if (formErrors.valid_until) {
        setFormErrors(prev => ({
          ...prev,
          valid_until: ""
        }));
      }
    }
  };
  
  const handleItemsChange = (items: any[]) => {
    setFormData(prev => ({
      ...prev,
      items
    }));
    setIsFormDirty(true);
    
    // Recalculate totals
    const total = calculateTotals(items);
    
    // Update formData with new total
    setFormData(prev => ({
      ...prev,
      total_amount: total
    }));
  };

  // Para birimi değişikliğini yönetme
  const handleCurrencyChange = (currency: string) => {
    // Teklif para birimini güncelle
    setFormData(prev => ({
      ...prev,
      currency
    }));
    setIsFormDirty(true);
    
    // Teklif kalemlerini yeni para birimine göre dönüştürme işlemi
    if (formData.items && formData.items.length > 0) {
      toast.info(`Tüm kalemler ${currency} para birimine dönüştürülecek`);
      
      // Teklif kalemleri için para birimi güncelleme işlemi burada yapılabilir
      // Bu işlem useProposalItems veya useProposalItemsManagement hook'unda 
      // yapılacağı için şimdilik boş bırakıyoruz
    }
    
    // Para birimi hata mesajını temizle
    if (formErrors.currency) {
      setFormErrors(prev => ({
        ...prev,
        currency: ""
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }
    
    try {
      setSaving(true);
      
      if (isNew) {
        await saveDraft(formData);
      } else {
        await onSave(formData);
      }
      
      setIsFormDirty(false);
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Teklif kaydedilirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return {
    formData,
    formErrors,
    isFormDirty,
    saving: saving || isSavingDraft || isCreating,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleItemsChange,
    handleCurrencyChange, // Para birimi değişikliği için fonksiyonu dışa aktar
    handleSave,
    validateForm
  };
};
