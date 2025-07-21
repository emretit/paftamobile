
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useProposalCreation } from "@/hooks/proposals/useProposalCreation";
import ProposalForm from "@/components/proposals/form/ProposalForm";

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
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Teklifler
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Yeni Teklif Oluştur</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => document.getElementById('proposal-form')?.dispatchEvent(
                new Event('submit', { bubbles: true, cancelable: true })
              )} 
              disabled={saving}
              size="sm"
              className="bg-primary hover:bg-primary/90 min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Card className="p-6 hover:shadow-sm transition-shadow">
          <div id="proposal-form">
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
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ProposalCreate;
