
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProposalFormData } from "@/types/proposal-form";
import { ProposalStatus, Proposal } from "@/types/proposal";
import { useProposalDraft } from "./useProposalDraft";
import { useProposalCreation } from "./useProposalCreation";
import { useProposalCalculations } from "./useProposalCalculations";
import { useTechnicianNames } from "@/components/service/hooks/useTechnicianNames";
import { useAuthState } from "@/components/navbar/useAuthState";
import { useExchangeRates } from "@/hooks/useExchangeRates";

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
  const [formInitialized, setFormInitialized] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { user } = useAuthState();
  const { employees } = useTechnicianNames();
  const { saveDraft, isLoading: isSavingDraft } = useProposalDraft();
  const { createProposal, isLoading: isCreating } = useProposalCreation();
  const { calculateTotals } = useProposalCalculations();
  const { convertCurrency } = useExchangeRates();

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
      setFormInitialized(true);
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
      setFormInitialized(true);
    }
  }, [initialProposal, isNew, employees, user]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      errors.title = "Teklif başlığı gereklidir";
    }
    
    if (!formData.customer_id) {
      errors.customer_id = "Müşteri seçimi gereklidir";
    }
    
    if (!formData.currency) {
      errors.currency = "Para birimi seçilmelidir";
    }
    
    // Ürün kalemleri için validasyon
    if (!formData.items || formData.items.length === 0) {
      errors.items = "En az bir teklif kalemi eklenmelidir";
    } else {
      // Kalem validasyonları (örnek: ürün adı, miktar, fiyat kontrolü)
      const invalidItems = formData.items.filter(item => 
        !item.name?.trim() || !item.quantity || item.quantity <= 0 || !item.unit_price || item.unit_price < 0
      );
      
      if (invalidItems.length > 0) {
        errors.items = "Bazı teklif kalemleri eksik veya hatalı bilgiler içeriyor";
      }
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
    console.log("Items changed:", items);
    
    setFormData(prev => ({
      ...prev,
      items
    }));
    setIsFormDirty(true);
    
    // Clear items error when items are updated
    if (formErrors.items) {
      setFormErrors(prev => ({
        ...prev,
        items: ""
      }));
    }
    
    // Recalculate totals
    const total = calculateTotals(items);
    
    // Update formData with new total
    setFormData(prev => ({
      ...prev,
      items,
      total_amount: total
    }));
  };

  // Para birimi değişikliğini yönetme
  const handleCurrencyChange = (currency: string) => {
    const prevCurrency = formData.currency || "TRY";
    
    // Eğer para birimi değişmiyorsa işlem yapma
    if (currency === prevCurrency) return;
    
    console.log(`Currency changing from ${prevCurrency} to ${currency}`);
    
    // Teklif para birimini güncelle
    setFormData(prev => ({
      ...prev,
      currency
    }));
    setIsFormDirty(true);
    
    // Teklif kalemlerini yeni para birimine göre dönüştürme işlemi
    if (formData.items && formData.items.length > 0) {
      console.log(`Converting ${formData.items.length} items from ${prevCurrency} to ${currency}`);
      
      const updatedItems = formData.items.map(item => {
        // Eğer ürünün orijinal para birimi saklanmışsa, dönüşümü oradan yap
        const sourceCurrency = item.original_currency || item.currency || prevCurrency;
        const sourcePrice = 
          sourceCurrency === item.original_currency && item.original_price !== undefined
            ? item.original_price
            : item.unit_price;
            
        console.log(`Converting item ${item.name} from ${sourceCurrency} to ${currency}`);
        console.log(`Original price: ${sourcePrice} ${sourceCurrency}`);

        // Para birimi dönüşümünü yap
        const convertedPrice = convertCurrency(sourcePrice, sourceCurrency, currency);
        console.log(`Converted price: ${convertedPrice} ${currency}`);
        
        // Vergi ve indirim oranlarını hesaba katarak toplam fiyatı güncelle
        const quantity = Number(item.quantity || 1);
        const discountRate = Number(item.discount_rate || 0);
        const taxRate = Number(item.tax_rate || 0);
        
        // Apply discount
        const discountedPrice = convertedPrice * (1 - discountRate / 100);
        // Calculate total with tax
        const totalPrice = quantity * discountedPrice * (1 + taxRate / 100);

        return {
          ...item,
          unit_price: convertedPrice,
          total_price: totalPrice,
          currency: currency
        };
      });
      
      // Güncellenmiş kalemleri form state'ine ekle
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      
      console.log("Items after currency conversion:", updatedItems);
      toast.success(`Tüm kalemler ${currency} para birimine dönüştürüldü`);
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
      return false;
    }
    
    try {
      setSaving(true);
      console.log("Saving form data:", formData);
      
      // Call the onSave function passed as a prop
      await onSave(formData);
      
      setIsFormDirty(false);
      setSaving(false);
      return true;
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("Teklif kaydedilirken bir hata oluştu");
      setSaving(false);
      return false;
    }
  };

  return {
    formData,
    formErrors,
    isFormDirty,
    formInitialized,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleItemsChange,
    handleCurrencyChange,
    handleSave,
    validateForm,
    saving
  };
};
