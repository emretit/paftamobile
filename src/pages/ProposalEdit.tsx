
import React from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalForm from "@/components/proposals/form/ProposalForm";
import { useProposalEdit } from "@/hooks/useProposalEdit";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const { proposal, loading, saving, handleBack, handleSave } = useProposalEdit();
  const { isLoading: isSaving } = useProposalForm();
  const navigate = useNavigate();

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Teklife Dön
        </Button>
      </div>
      
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
