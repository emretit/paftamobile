
import React from 'react';
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import ProposalForm from "@/components/proposals/form/ProposalForm";
import { toast } from "sonner";
import { useProposalForm } from "@/hooks/useProposalForm";
import { crmService } from "@/services/crmService";

interface ProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalCreate = ({ isCollapsed, setIsCollapsed }: ProposalCreateProps) => {
  const navigate = useNavigate();
  const [saving, setSaving] = React.useState(false);
  const { createProposal } = useProposalForm();

  const handleBack = () => {
    navigate("/proposals");
  };

  const handleSave = async (formData: any) => {
    try {
      setSaving(true);
      const result = await crmService.createProposal({
        title: formData.title,
        description: formData.description,
        valid_until: formData.valid_until,
        payment_terms: formData.payment_terms,
        delivery_terms: formData.delivery_terms,
        notes: formData.notes,
        status: formData.status,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success("Teklif başarıyla oluşturuldu");
      navigate("/proposals");
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
