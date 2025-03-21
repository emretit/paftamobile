
import React from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalForm from "@/components/proposals/form/ProposalForm";
import { useProposalEdit } from "@/hooks/useProposalEdit";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const { proposal, loading, saving, handleBack, handleSave } = useProposalEdit();
  const { isLoading: isSaving } = useProposalForm();

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin"
    >
      <ProposalForm
        proposal={proposal}
        loading={loading}
        saving={saving || isSaving}
        isNew={false}
        onSave={handleSave}
        onBack={handleBack}
        title="Teklif Düzenle"
        subtitle="Teklif bilgilerini güncelleyin"
      />
    </DefaultLayout>
  );
};

export default ProposalEdit;
