
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Proposal } from "@/types/proposal";
import { useProposalFormState } from "@/hooks/proposals/useProposalFormState";

// Import sub-components
import ProposalFormHeader from "./ProposalFormHeader";
import ProposalFormContent from "./ProposalFormContent";
import ProposalFormActions from "./ProposalFormActions";

interface ProposalFormProps {
  proposal: Proposal | null;
  loading: boolean;
  saving?: boolean; // Make this optional so it's compatible with old and new usages
  isNew: boolean;
  onSave: (formData: any) => Promise<void>;
  onBack: () => void;
  title: string;
  subtitle: string;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  proposal,
  loading,
  saving = false, // Provide default value
  isNew,
  onSave,
  onBack,
  title,
  subtitle
}) => {
  const {
    formData,
    formErrors,
    saving: formSaving,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleItemsChange,
    handleSave
  } = useProposalFormState(proposal, isNew, onSave);

  // Use either the passed saving prop or the one from the form state
  const isSaving = saving || formSaving;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch (error) {
      return "";
    }
  };

  return (
    <Card className="p-6 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        <ProposalFormHeader
          proposal={proposal}
          loading={loading}
          saving={isSaving}
          isNew={isNew}
          onSave={handleSave}
          onBack={onBack}
          title={title}
        />
        
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
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
            formatDate={formatDate}
          />
        )}
        
        <ProposalFormActions
          isNew={isNew}
          saving={isSaving}
          onSave={handleSave}
          onBack={onBack}
        />
      </CardContent>
    </Card>
  );
};

export default ProposalForm;
