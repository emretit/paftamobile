
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalFormShared from "@/components/proposals/form/ProposalFormShared";

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
      setSaving(true);
      
      // Yeni teklif oluşturma
      await saveDraft(formData);
      
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
      title="Yeni Teklif Oluştur"
      subtitle="Müşterileriniz için yeni bir teklif hazırlayın"
    >
      <Card className="p-6">
        <CardContent className="p-0">
          <ProposalFormShared 
            proposal={null}
            loading={false}
            saving={saving || isLoading}
            isNew={true}
            onSave={handleSave}
            onBack={handleBack}
          />
        </CardContent>
      </Card>
    </DefaultLayout>
  );
};

export default ProposalCreate;
