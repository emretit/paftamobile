
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Proposal } from "@/types/proposal";
import { useProposalFormState } from "@/hooks/proposals/useProposalFormState";
import ProposalFormHeader from "./ProposalFormHeader";
import ProposalFormContent from "./ProposalFormContent";
import ProposalFormActions from "./ProposalFormActions";
import ProposalCurrencySelector from "./ProposalCurrencySelector";

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
  isNew,
  onSave,
  onBack,
  title,
  subtitle
}) => {
  const {
    formData,
    formErrors,
    isFormDirty,
    saving: formSaving,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleItemsChange,
    handleSave,
    validateForm,
    handleCurrencyChange,
  } = useProposalFormState(proposal, isNew, onSave);

  return (
    <>
      <ProposalFormHeader 
        title={title}
        subtitle={subtitle}
        loading={loading}
        saving={saving || formSaving}
        isNew={isNew}
        proposal={proposal}
      />

      {/* Global Para Birimi Seçici */}
      <ProposalCurrencySelector 
        selectedCurrency={formData.currency || "TRY"}
        onCurrencyChange={handleCurrencyChange}
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ProposalFormContent
          formData={formData}
          formErrors={formErrors}
          isNew={isNew}
          proposal={proposal}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleDateChange={handleDateChange}
          handleItemsChange={handleItemsChange}
          formatDate={(dateString) => {
            if (!dateString) return "";
            return new Date(dateString).toLocaleDateString("tr-TR");
          }}
        />
      )}

      <ProposalFormActions 
        isNew={isNew}
        saving={saving || formSaving}
        onSave={handleSave}
        onBack={onBack}
        isFormDirty={isFormDirty}
      />
    </>
  );
};

export default ProposalForm;
