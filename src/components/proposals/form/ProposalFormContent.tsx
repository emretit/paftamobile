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
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="mb-4">
            <h3 className="text-base font-medium mb-3">Temel Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="title">Teklif Başlığı</Label>
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
              
              <div className="space-y-1">
                <Label htmlFor="valid_until">Geçerlilik Tarihi</Label>
                <DatePicker 
                  selected={validUntilDate}
                  onSelect={(date) => handleDateChange(date)}
                  className={formErrors.valid_until ? "border-red-500" : ""}
                />
                {formErrors.valid_until && (
                  <p className="text-xs text-red-500">{formErrors.valid_until}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
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
          
          <div className="mb-4">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Teklif açıklaması girin"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-base font-medium mb-3">Teklif Detayları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="payment_terms">Ödeme Koşulları</Label>
              <Textarea
                id="payment_terms"
                name="payment_terms"
                value={formData.payment_terms || ""}
                onChange={handleInputChange}
                placeholder="Ödeme koşullarını girin"
                rows={2}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="delivery_terms">Teslimat Koşulları</Label>
              <Textarea
                id="delivery_terms"
                name="delivery_terms"
                value={formData.delivery_terms || ""}
                onChange={handleInputChange}
                placeholder="Teslimat koşullarını girin"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden" id="proposal-items-section">
        <CardContent className="p-4">
          <h3 className="text-base font-medium mb-3">Teklif Kalemleri</h3>
          <ProposalItems 
            items={formData.items || []} 
            onItemsChange={handleItemsChange}
            globalCurrency={formData.currency || "TRY"} 
          />
          {formErrors.items && <p className="text-xs text-red-500 mt-1">{formErrors.items}</p>}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <h3 className="text-base font-medium mb-3">Notlar ve Açıklamalar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="notes">Müşteriye Notlar</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                placeholder="Müşteriye gösterilecek notlar"
                rows={2}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="internalNotes">İç Notlar</Label>
              <Textarea
                id="internalNotes"
                name="internalNotes"
                value={formData.internalNotes || ""}
                onChange={handleInputChange}
                placeholder="Sadece şirket içi görülebilecek notlar"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalFormContent;