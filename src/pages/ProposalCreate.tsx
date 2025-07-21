
// Redesigned ProposalCreate.tsx for better UX
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const handleBack = () => navigate("/proposals");

  const handleFormSave = async (formData: any) => {
    try {
      setSaving(true);
      const result = await createProposal(formData);
      if (result) {
        toast.success("Teklif başarıyla oluşturuldu");
        navigate("/proposals");
      }
    } catch (error) {
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
      subtitle="Yeni teklif oluşturun ve kaydedin"
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
              <h1 className="text-xl font-semibold">Yeni Teklif</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Taslak
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Card className="hover:shadow-sm transition-shadow">
          <div className="p-6">
            <ProposalForm
              proposal={null}
              loading={false}
              saving={saving}
              isNew={true}
              onSave={handleFormSave}
              onBack={handleBack}
              title="Yeni Teklif"
              subtitle="Teklif bilgilerini girin"
            />
          </div>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ProposalCreate;
