
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, CalendarIcon, Building, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatCurrency } from "@/components/products/utils/priceUtils";
import { Proposal, ProposalStatus, proposalStatusLabels } from "@/types/proposal";
import { Skeleton } from "@/components/ui/skeleton";

interface ProposalFormSharedProps {
  proposal: Proposal | null;
  loading: boolean;
  saving: boolean;
  isNew: boolean;
  onSave: (formData: any) => Promise<void>;
  onBack: () => void;
}

const ProposalFormShared = ({
  proposal,
  loading,
  saving,
  isNew,
  onSave,
  onBack,
}: ProposalFormSharedProps) => {
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    valid_until: "",
    payment_terms: "",
    delivery_terms: "",
    notes: "",
    status: "draft" as ProposalStatus
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    if (proposal && !isNew) {
      // Initialize form with proposal data for edit mode
      setFormData({
        title: proposal.title || "",
        description: proposal.description || "",
        valid_until: proposal.valid_until || "",
        payment_terms: proposal.payment_terms || "",
        delivery_terms: proposal.delivery_terms || "",
        notes: proposal.notes || "",
        status: proposal.status
      });
    }
  }, [proposal, isNew]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Teklif başlığı gereklidir";
    }
    
    if (!formData.valid_until) {
      errors.valid_until = "Geçerlilik tarihi gereklidir";
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

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }
    
    await onSave(formData);
    setIsFormDirty(false);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "";
    }
  };

  const getTitle = () => {
    if (loading) return <Skeleton className="h-8 w-40" />;
    return isNew ? "Yeni Teklif Oluştur" : `${formData.title} Düzenle`;
  };

  const getButtonText = () => {
    return isNew ? "Teklif Oluştur" : "Değişiklikleri Kaydet";
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold">
            {getTitle()}
          </h1>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading || saving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {getButtonText()}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className={formErrors.title ? "text-red-500" : ""}>
                  Teklif Başlığı <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Teklif başlığını girin"
                  className={formErrors.title ? "border-red-500 focus:ring-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange("status", value as ProposalStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{proposalStatusLabels.draft}</SelectItem>
                    <SelectItem value="pending_approval">{proposalStatusLabels.pending_approval}</SelectItem>
                    <SelectItem value="sent">{proposalStatusLabels.sent}</SelectItem>
                    <SelectItem value="accepted">{proposalStatusLabels.accepted}</SelectItem>
                    <SelectItem value="rejected">{proposalStatusLabels.rejected}</SelectItem>
                    <SelectItem value="expired">{proposalStatusLabels.expired}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valid_until" className={formErrors.valid_until ? "text-red-500" : ""}>
                  Geçerlilik Tarihi <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`w-full justify-start text-left font-normal ${
                        formErrors.valid_until ? "border-red-500 text-red-500" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.valid_until ? formatDate(formData.valid_until) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.valid_until ? new Date(formData.valid_until) : undefined}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.valid_until && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.valid_until}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {!isNew && proposal && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center mb-2">
                      <Building className="h-4 w-4 mr-2" />
                      Müşteri
                    </div>
                    <div className="font-medium">
                      {proposal.customer?.name || proposal.customer_name || "Müşteri belirtilmemiş"}
                    </div>
                    
                    {proposal.customer?.company && (
                      <div className="text-sm text-muted-foreground">
                        {proposal.customer.company}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center mb-2">
                      <User className="h-4 w-4 mr-2" />
                      Satış Temsilcisi
                    </div>
                    <div className="font-medium">
                      {proposal.employee 
                        ? `${proposal.employee.first_name} ${proposal.employee.last_name}` 
                        : proposal.employee_name || "Belirtilmemiş"}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center mb-2">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Toplam Tutar
                    </div>
                    <div className="font-medium text-lg">
                      {formatCurrency(proposal.total_amount || 0, proposal.currency || "TRY")}
                    </div>
                  </div>
                </>
              )}
              
              {isNew && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      Teklif oluşturulduktan sonra müşteri ve ürün bilgileri burada görüntülenecek.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea 
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Teklif açıklaması girin"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Ödeme Şartları</Label>
              <Textarea 
                id="payment_terms"
                name="payment_terms"
                value={formData.payment_terms || ""}
                onChange={handleInputChange}
                placeholder="Ödeme şartlarını belirtin"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delivery_terms">Teslimat Şartları</Label>
              <Textarea 
                id="delivery_terms"
                name="delivery_terms"
                value={formData.delivery_terms || ""}
                onChange={handleInputChange}
                placeholder="Teslimat şartlarını belirtin"
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea 
              id="notes"
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              placeholder="Ek notlar girin"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onBack}>
              İptal
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {getButtonText()}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProposalFormShared;
