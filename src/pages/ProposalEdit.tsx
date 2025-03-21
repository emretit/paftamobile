
import React from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalFormShared from "@/components/proposals/form/ProposalFormShared";
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
      <Card className="p-6">
        <CardContent className="p-0">
          <ProposalFormShared 
            proposal={proposal}
            loading={loading}
            saving={saving || isSaving}
            isNew={false}
            onSave={handleSave}
            onBack={handleBack}
          />
        </CardContent>
      </Card>
    </DefaultLayout>
  );
};

export default ProposalEdit;
