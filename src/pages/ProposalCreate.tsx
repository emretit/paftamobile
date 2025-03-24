
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalForm from "@/components/proposals/form/ProposalForm";
import { toast } from "sonner";

interface ProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreate = ({ isCollapsed, setIsCollapsed }: ProposalCreateProps) => {
  const navigate = useNavigate();
  const { saveDraft, isLoading } = useProposalForm();
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    navigate("/proposals");
  };

  const handleSave = async (formData: any) => {
    try {
      // Check for empty items
      if (!formData.items || formData.items.length === 0) {
        toast.warning("Lütfen en az bir teklif kalemi ekleyin.");
        return;
      }

      setSaving(true);
      // Create new proposal
      await saveDraft(formData);
      toast.success("Teklif taslak olarak kaydedildi.");
      navigate("/proposals");
    } catch (error) {
      console.error("Error creating proposal:", error);
      toast.error("Teklif oluşturulurken bir hata oluştu.");
    } finally {
      setSaving(false);
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
        saving={saving || isLoading}
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
