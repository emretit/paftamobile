
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useProposalCreation } from "@/hooks/proposals/useProposalCreation";
import UnifiedProposalForm from "@/components/proposals/form/UnifiedProposalForm";

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
      console.log("Saving new proposal with data:", formData);
      
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-2xl font-bold">
            Yeni Teklif Oluştur
          </h1>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => document.getElementById('proposal-form')?.dispatchEvent(
              new Event('submit', { bubbles: true, cancelable: true })
            )} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Teklifi Kaydet"}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <Card className="p-6">
        <div id="proposal-form">
          <UnifiedProposalForm
            proposal={null}
            loading={false}
            saving={saving}
            isNew={true}
            onSave={handleSave}
            onBack={handleBack}
            title="Yeni Teklif"
            subtitle="Yeni bir teklif oluşturun"
          />
        </div>
      </Card>
    </DefaultLayout>
  );
};

export default ProposalCreate;
