
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import ProposalFormHeader from "./ProposalFormHeader";
import ProposalFormBasicInfo from "./ProposalFormBasicInfo";
import ProposalFormCustomerSelect from "./ProposalFormCustomerSelect";
import ProposalItems from "./items/ProposalItems";
import ProposalFormTerms from "./ProposalFormTerms";
import ProposalCurrencySelector from "./ProposalCurrencySelector";
import { useProposalFormState } from "@/hooks/proposals/useProposalFormState";
import { Proposal } from "@/types/proposal";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ProposalFormProps {
  proposal: Proposal | null;
  loading: boolean;
  saving: boolean;
  isNew: boolean;
  onSave: (formData: any) => Promise<void>;
  onBack: () => void;
  title: string;
  subtitle: string;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  proposal,
  loading,
  saving,
  isNew = false,
  onSave,
  onBack,
  title,
  subtitle
}) => {
  const {
    formData,
    formErrors,
    isFormDirty,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleItemsChange,
    handleCurrencyChange,
    handleSave,
    validateForm
  } = useProposalFormState(proposal, isNew, onSave);

  // Function to handle the form submission
  const submitForm = async () => {
    try {
      if (!validateForm()) {
        toast.error("Lütfen gerekli alanları doldurun");
        return;
      }
      
      await handleSave();
    } catch (error) {
      console.error("Error saving proposal:", error);
      toast.error("Teklif kaydedilirken bir hata oluştu");
    }
  };

  // Handle the currency change and update all items' prices
  const handleGlobalCurrencyChange = (currency: string) => {
    // This will trigger the currency change in the form state
    handleCurrencyChange(currency);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-48">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[300px]" />
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-8 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProposalFormHeader
        title={title}
        subtitle={subtitle}
        loading={loading}
        saving={saving}
        isNew={isNew}
        proposal={proposal}
        onBack={onBack}
        onSave={submitForm}
        isFormDirty={isFormDirty}
        validateForm={validateForm}
      />

      <div className="flex flex-col gap-6">
        <div className="space-y-6 w-full">
          <ProposalCurrencySelector 
            selectedCurrency={formData.currency || "TRY"} 
            onCurrencyChange={handleGlobalCurrencyChange}
            items={formData.items}
            onItemsChange={handleItemsChange}
          />

          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Teklif Detayları</h3>
              
              <ProposalFormBasicInfo
                formData={{
                  title: formData.title,
                  status: formData.status,
                  valid_until: formData.valid_until
                }}
                formErrors={formErrors}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleDateChange={handleDateChange}
                formatDate={(date) => date ? new Date(date).toLocaleDateString() : ''}
              />
              
              <ProposalFormCustomerSelect
                selectedCustomerId={formData.customer_id}
                onSelectCustomer={(customerId) => handleSelectChange("customer_id", customerId)}
                error={formErrors.customer_id}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Ürünler / Hizmetler</h3>
              
              <ProposalItems
                items={formData.items || []}
                onItemsChange={handleItemsChange}
                selectedCurrency={formData.currency || "TRY"}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Şartlar ve Koşullar</h3>
              
              <ProposalFormTerms
                paymentTerms={formData.payment_terms}
                deliveryTerms={formData.delivery_terms}
                notes={formData.notes}
                onInputChange={handleInputChange}
              />
            </div>
          </Card>

          <div className="flex gap-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={saving}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <Button
              type="button"
              onClick={submitForm}
              className="flex-1"
              disabled={saving}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalForm;
