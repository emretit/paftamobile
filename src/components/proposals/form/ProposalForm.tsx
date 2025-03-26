
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProposalFormHeader from "./ProposalFormHeader"; // Corrected import path
import ProposalBasicInfo from "./ProposalFormBasicInfo"; // Corrected import path
import ProposalCustomerSelect from "./ProposalFormCustomerSelect"; // Corrected import path
import ProposalItems from "./items/ProposalItems";
import ProposalTerms from "./ProposalFormTerms"; // Corrected import path
import ProposalCurrencySelector from "./ProposalCurrencySelector";
import { useProposalFormState } from "@/hooks/proposals/useProposalFormState";
import ProposalTemplateSelect from "./ProposalTemplateSelect"; // This may need update if the file doesn't exist
import { Proposal } from "@/types/proposal";
import { Skeleton } from "@/components/ui/skeleton"; // Added for loading state

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
  const [activeTab, setActiveTab] = useState<string>("details");

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
      />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="space-y-6 w-full">
          {isNew && (
            <ProposalTemplateSelect />
          )}

          <ProposalCurrencySelector 
            selectedCurrency={formData.currency || "TRY"} 
            onCurrencyChange={handleCurrencyChange}
            items={formData.items}
            onItemsChange={handleItemsChange}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-md mb-6">
              <TabsTrigger className="flex-1" value="details">
                Teklif Detayları
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="items">
                Ürünler / Hizmetler
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="terms">
                Şartlar ve Koşullar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card className="p-6">
                <ProposalBasicInfo
                  title={formData.title}
                  description={formData.description}
                  validUntil={formData.valid_until}
                  employeeId={formData.employee_id}
                  errors={formErrors}
                  onInputChange={handleInputChange}
                  onDateChange={handleDateChange}
                  onSelectChange={handleSelectChange}
                />
              </Card>

              <Card className="p-6">
                <ProposalCustomerSelect
                  selectedCustomerId={formData.customer_id}
                  onSelectCustomer={(customerId) => handleSelectChange("customer_id", customerId)}
                  error={formErrors.customer_id}
                />
              </Card>
            </TabsContent>

            <TabsContent value="items">
              <Card className="p-6">
                <ProposalItems
                  items={formData.items || []}
                  onItemsChange={handleItemsChange}
                  globalCurrency={formData.currency}
                />
              </Card>
            </TabsContent>

            <TabsContent value="terms">
              <Card className="p-6">
                <ProposalTerms
                  paymentTerms={formData.payment_terms}
                  deliveryTerms={formData.delivery_terms}
                  notes={formData.notes}
                  onInputChange={handleInputChange}
                />
              </Card>
            </TabsContent>
          </Tabs>

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
              onClick={handleSave}
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
