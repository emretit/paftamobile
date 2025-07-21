import React, { useEffect } from "react";
import { ProposalFormData } from "@/types/proposal-form";
import { Proposal } from "@/types/proposal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ProposalItems from "./items/ProposalItems";
import { DatePicker } from "@/components/ui/date-picker";
import CustomerSelector from "./CustomerSelector";
import EmployeeSelector from "./EmployeeSelector";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";

interface ProposalFormContentProps {
  formData: ProposalFormData;
  formErrors: Record<string, string>;
  isNew: boolean;
  proposal: Proposal | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleItemsChange: (items: any[]) => void;
  formatDate: (dateString?: string | null) => string;
}

const ProposalFormContent: React.FC<ProposalFormContentProps> = ({
  formData,
  formErrors,
  isNew,
  proposal,
  handleInputChange,
  handleSelectChange,
  handleDateChange,
  handleItemsChange,
  formatDate,
}) => {
  const [searchParams] = useSearchParams();
  const focusSection = searchParams.get('focus');

  // Auto scroll to items section if focus=items in URL
  useEffect(() => {
    if (focusSection === 'items') {
      setTimeout(() => {
        const itemsSection = document.getElementById('proposal-items-section');
        if (itemsSection) {
          itemsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          // Add a subtle highlight effect
          itemsSection.style.border = '2px solid hsl(var(--primary))';
          itemsSection.style.borderRadius = '0.5rem';
          setTimeout(() => {
            itemsSection.style.border = '';
          }, 3000);
        }
      }, 500); // Small delay to ensure DOM is rendered
    }
  }, [focusSection]);

  // Convert string date to Date object for DatePicker
  const validUntilDate = formData.valid_until ? new Date(formData.valid_until) : undefined;

  return (
    <div className="space-y-6">
      {/* Temel Bilgiler - Daha kompakt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Teklif Başlığı</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={formErrors.title ? "border-red-500" : ""}
              placeholder="Teklif başlığını girin"
            />
            {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Teklif açıklaması girin"
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valid_until" className="text-sm font-medium">Geçerlilik Tarihi</Label>
            <DatePicker 
              selected={validUntilDate}
              onSelect={(date) => handleDateChange(date)}
              className={formErrors.valid_until ? "border-red-500" : ""}
            />
            {formErrors.valid_until && (
              <p className="text-xs text-red-500">{formErrors.valid_until}</p>
            )}
          </div>
          
          <CustomerSelector
            value={formData.customer_id || ""}
            onChange={(value) => handleSelectChange("customer_id", value)}
            error={formErrors.customer_id}
          />
          
          <EmployeeSelector
            value={formData.employee_id || ""}
            onChange={(value) => handleSelectChange("employee_id", value)}
            error={formErrors.employee_id}
          />
        </div>
      </div>

      {/* Koşullar - Yan yana ve kompakt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment_terms" className="text-sm font-medium">Ödeme Koşulları</Label>
          <Textarea
            id="payment_terms"
            name="payment_terms"
            value={formData.payment_terms || ""}
            onChange={handleInputChange}
            placeholder="Ödeme koşullarını girin"
            rows={3}
            className="resize-none"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="delivery_terms" className="text-sm font-medium">Teslimat Koşulları</Label>
          <Textarea
            id="delivery_terms"
            name="delivery_terms"
            value={formData.delivery_terms || ""}
            onChange={handleInputChange}
            placeholder="Teslimat koşullarını girin"
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* Teklif Kalemleri - Tam genişlik */}
      <Card className="border-l-4 border-l-primary" id="proposal-items-section">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-primary">Teklif Kalemleri</h3>
          <ProposalItems 
            items={formData.items || []} 
            onItemsChange={handleItemsChange}
            globalCurrency={formData.currency || "TRY"} 
          />
          {formErrors.items && <p className="text-xs text-red-500 mt-2">{formErrors.items}</p>}
        </CardContent>
      </Card>

      {/* Notlar - Yan yana ve kompakt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">Müşteriye Notlar</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes || ""}
            onChange={handleInputChange}
            placeholder="Müşteriye gösterilecek notlar"
            rows={3}
            className="resize-none"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="internalNotes" className="text-sm font-medium">İç Notlar</Label>
          <Textarea
            id="internalNotes"
            name="internalNotes"
            value={formData.internalNotes || ""}
            onChange={handleInputChange}
            placeholder="Sadece şirket içi görülebilecek notlar"
            rows={3}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalFormContent;