
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Proposal } from "@/types/proposal";
import { useProposalFormState } from "@/hooks/proposals/useProposalFormState";
import { useForm } from "react-hook-form";
import ProposalFormHeader from "./ProposalFormHeader";
import ProposalFormContent from "./ProposalFormContent";
import ProposalFormActions from "./ProposalFormActions";
import { DirectCurrencySelector } from "./ProposalCurrencySelector";
import { ProposalFormData } from "@/types/proposal-form";

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
  saving: externalSaving,
  isNew,
  onSave,
  onBack,
  title,
  subtitle
}) => {
  const form = useForm<ProposalFormData>({
    defaultValues: {
      title: proposal?.title || "",
      status: proposal?.status || "draft",
      currency: proposal?.currency || "TRY",
      items: proposal?.items || []
    }
  });

  const {
    formData,
    formErrors,
    isFormDirty,
    saving: formSaving,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleItemsChange,
    handleCurrencyChange,
    handleSave,
    validateForm
  } = useProposalFormState(proposal, isNew, onSave);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  return (
    <>
      <ProposalFormHeader 
        title={title}
        subtitle={subtitle}
        loading={loading}
        saving={externalSaving || formSaving}
        isNew={isNew}
        proposal={proposal}
      />

      {/* Global Para Birimi Seçici */}
      <div className="mb-6">
        <DirectCurrencySelector 
          selectedCurrency={formData.currency || "TRY"}
          onCurrencyChange={handleCurrencyChange}
        />
      </div>

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
          handleDateChange={(name, date) => handleDateChange(name, date)}
          handleItemsChange={handleItemsChange}
          formatDate={formatDate}
        />
      )}

      <ProposalFormActions 
        isNew={isNew}
        saving={externalSaving || formSaving}
        onSave={handleSave}
        onBack={onBack}
        isFormDirty={isFormDirty}
      />
    </>
  );
};

export default ProposalForm;
