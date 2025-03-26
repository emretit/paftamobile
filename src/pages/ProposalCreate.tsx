
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ProposalForm from "@/components/proposals/form/ProposalForm";
import { toast } from "sonner";
import { useProposalCreation } from "@/hooks/proposals/useProposalCreation";

interface ProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreate = ({ isCollapsed, setIsCollapsed }: ProposalCreateProps) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { createProposal } = useProposalCreation();

  const handleBack = () => {
    navigate("/proposals");
  };

  const handleSave = async (formData: any) => {
    try {
      setSaving(true);
      console.log("Saving proposal with data:", formData);
      
      // Use the createProposal function directly
      const result = await createProposal(formData);
      
      if (result) {
        toast.success("Teklif başarıyla oluşturuldu");
        navigate("/proposals");
      } else {
        throw new Error("Teklif oluşturulurken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Teklif oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Yeni Teklif"
      subtitle="Yeni bir teklif oluşturun"
    >
      <ProposalForm
        proposal={null}
        loading={false}
        saving={saving}
        isNew={true}
        onSave={handleSave}
        onBack={handleBack}
        title="Yeni Teklif"
        subtitle="Yeni bir teklif oluşturun"
      />
    </DefaultLayout>
  );
};

export default ProposalCreate;
