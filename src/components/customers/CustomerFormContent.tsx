import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerFormData } from "@/types/customer";
import BasicInformationCard from "./form/BasicInformationCard";
import ContactInformationCard from "./form/ContactInformationCard";
import AddressInformationCard from "./form/AddressInformationCard";
import CompanyInformationCard from "./form/CompanyInformationCard";
import FinancialInformationCard from "./form/FinancialInformationCard";
import EInvoiceInformationCard from "./form/EInvoiceInformationCard";

interface CustomerFormContentProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isPending: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

const CustomerFormContent = ({
  formData,
  setFormData,
  handleSubmit,
  isPending,
  isEdit,
  onCancel
}: CustomerFormContentProps) => {
  return (
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <BasicInformationCard formData={formData} setFormData={setFormData} />
            <ContactInformationCard formData={formData} setFormData={setFormData} />
            <AddressInformationCard formData={formData} setFormData={setFormData} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <CompanyInformationCard formData={formData} setFormData={setFormData} />
            <FinancialInformationCard formData={formData} setFormData={setFormData} />
            <EInvoiceInformationCard formData={formData} setFormData={setFormData} />
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="p-6 bg-gradient-to-r from-background via-muted/5 to-background border shadow-sm">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-8 py-2.5"
              disabled={isPending}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="px-8 py-2.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              {isPending ? "Kaydediliyor..." : (isEdit ? "Güncelle" : "Müşteriyi Kaydet")}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CustomerFormContent;