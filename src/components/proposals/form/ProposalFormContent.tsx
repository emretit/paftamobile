
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ProposalFormData } from "@/types/proposal-form";
import { Proposal } from "@/types/proposal";
import ProposalItems from "./items/ProposalItems";
import CustomerSelector from "../form/CustomerSelector";
import EmployeeSelector from "../form/EmployeeSelector";

interface ProposalFormContentProps {
  formData: ProposalFormData;
  formErrors: Record<string, string>;
  isNew: boolean;
  proposal: Proposal | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleItemsChange: (items: any[]) => void;
  formatDate: (date?: string | null) => string;
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
  const statusOptions = [
    { value: "draft", label: "Taslak" },
    { value: "sent", label: "Gönderildi" },
    { value: "accepted", label: "Kabul Edildi" },
    { value: "rejected", label: "Reddedildi" },
    { value: "expired", label: "Süresi Dolmuş" },
    { value: "cancelled", label: "İptal Edildi" },
    { value: "revised", label: "Revize Edildi" },
    { value: "pending_approval", label: "Onay Bekliyor" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <FormField
          name="title"
          render={() => (
            <FormItem>
              <FormLabel>Teklif Başlığı</FormLabel>
              <FormControl>
                <Input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  placeholder="Teklif Başlığı"
                  className={formErrors.title ? "border-red-500" : ""}
                />
              </FormControl>
              {formErrors.title && <FormMessage>{formErrors.title}</FormMessage>}
            </FormItem>
          )}
        />

        <FormField
          name="status"
          render={() => (
            <FormItem>
              <FormLabel>Durum</FormLabel>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <FormControl>
                  <SelectTrigger className={formErrors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Durum Seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.status && <FormMessage>{formErrors.status}</FormMessage>}
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <FormField
        name="description"
        render={() => (
          <FormItem>
            <FormLabel>Açıklama</FormLabel>
            <FormControl>
              <Textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Teklif Açıklaması"
                className="min-h-[100px]"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          name="valid_until"
          render={() => (
            <FormItem>
              <FormLabel>Geçerlilik Tarihi</FormLabel>
              <FormControl>
                <DatePicker
                  date={formData.valid_until ? new Date(formData.valid_until) : undefined}
                  onSelect={handleDateChange}
                  className={formErrors.valid_until ? "border-red-500" : ""}
                />
              </FormControl>
              {formErrors.valid_until && <FormMessage>{formErrors.valid_until}</FormMessage>}
            </FormItem>
          )}
        />

        <FormField
          name="payment_terms"
          render={() => (
            <FormItem>
              <FormLabel>Ödeme Koşulları</FormLabel>
              <FormControl>
                <Input
                  name="payment_terms"
                  value={formData.payment_terms || ""}
                  onChange={handleInputChange}
                  placeholder="Ödeme Koşulları"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="delivery_terms"
          render={() => (
            <FormItem>
              <FormLabel>Teslimat Koşulları</FormLabel>
              <FormControl>
                <Input
                  name="delivery_terms"
                  value={formData.delivery_terms || ""}
                  onChange={handleInputChange}
                  placeholder="Teslimat Koşulları"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Items Section */}
      <div className="mt-8">
        <ProposalItems 
          items={formData.items || []} 
          onItemsChange={handleItemsChange} 
          globalCurrency={formData.currency || "TRY"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          name="notes"
          render={() => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  placeholder="Müşteriye Özel Notlar"
                  className="min-h-[80px]"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="internalNotes"
          render={() => (
            <FormItem>
              <FormLabel>İç Notlar</FormLabel>
              <FormControl>
                <Textarea
                  name="internalNotes"
                  value={formData.internalNotes || ""}
                  onChange={handleInputChange}
                  placeholder="Şirket İçi Notlar (Müşteriye Gösterilmez)"
                  className="min-h-[80px]"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ProposalFormContent;
