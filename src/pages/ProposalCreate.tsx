
import React from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalForm from "@/components/proposals/form/ProposalForm";

interface ProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreate = ({ isCollapsed, setIsCollapsed }: ProposalCreateProps) => {
  const navigate = useNavigate();
  const { saveDraft, isLoading } = useProposalForm();

  const handleBack = () => {
    navigate("/proposals");
  };

  const handleSave = async (formData: any) => {
    try {
      // Create new proposal
      await saveDraft(formData);
      navigate("/proposals");
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Yeni Teklif Oluştur"
      subtitle="Müşterileriniz için yeni bir teklif hazırlayın"
    >
      <ProposalForm
        proposal={null}
        loading={false}
        isNew={true}
        onSave={handleSave}
        onBack={handleBack}
        title="Yeni Teklif Oluştur"
        subtitle="Müşterileriniz için yeni bir teklif hazırlayın"
      />
    </DefaultLayout>
  );
};

export default ProposalCreate;
