
import React from "react";
import { ProposalFormData } from "@/types/proposal-form";
import { Proposal } from "@/types/proposal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ProposalItems from "./items/ProposalItems";
import { DatePicker } from "@/components/ui/date-picker";
import CustomerSelector from "./CustomerSelector";
import EmployeeSelector from "./EmployeeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  // Convert string date to Date object for DatePicker
  const validUntilDate = formData.valid_until ? new Date(formData.valid_until) : undefined;

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="mb-4">
        <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
        <TabsTrigger value="details">Detaylar</TabsTrigger>
        <TabsTrigger value="items">Teklif Kalemleri</TabsTrigger>
        <TabsTrigger value="notes">Notlar</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Teklif Başlığı</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={formErrors.title ? "border-red-500" : ""}
                placeholder="Teklif başlığını girin"
              />
              {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Teklif açıklaması girin"
                rows={3}
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="valid_until">Geçerlilik Tarihi</Label>
              <DatePicker 
                selected={validUntilDate}
                onSelect={(date) => handleDateChange(date)}
                className={formErrors.valid_until ? "border-red-500" : ""}
              />
              {formErrors.valid_until && (
                <p className="text-sm text-red-500 mt-1">{formErrors.valid_until}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="details" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teklif Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
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
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="items" className="space-y-4">
        <ProposalItems 
          items={formData.items || []} 
          onItemsChange={handleItemsChange}
          globalCurrency={formData.currency || "TRY"} 
        />
        {formErrors.items && <p className="text-sm text-red-500">{formErrors.items}</p>}
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notlar ve Açıklamalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Müşteriye Notlar</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                placeholder="Müşteriye gösterilecek notlar"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="internalNotes">İç Notlar</Label>
              <Textarea
                id="internalNotes"
                name="internalNotes"
                value={formData.internalNotes || ""}
                onChange={handleInputChange}
                placeholder="Sadece şirket içi görülebilecek notlar"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProposalFormContent;
