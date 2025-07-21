
// Redesigned ProposalCreate.tsx for better UX
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Clock, Save, Send, AlertCircle, Loader2 } from "lucide-react";
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
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const { createProposal } = useProposalCreation();

  const handleBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm("Kaydedilmemiş değişiklikleriniz var. Çıkmak istediğinize emin misiniz?");
      if (!confirmed) return;
    }
    navigate("/proposals");
  };

  const handleFormSave = async (formData: any) => {
    try {
      setSaving(true);
      const result = await createProposal(formData);
      if (result) {
        toast.success("Teklif başarıyla oluşturuldu");
        setHasChanges(false);
        navigate("/proposals");
      }
    } catch (error) {
      toast.error("Teklif oluşturulurken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setAutoSaving(true);
    // Draft save logic would go here
    setTimeout(() => {
      setAutoSaving(false);
      toast.success("Taslak kaydedildi");
    }, 1000);
  };

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Yeni Teklif"
      subtitle="Yeni teklif oluşturun ve kaydedin"
    >
      {/* Enhanced Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between py-3 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Teklifler
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">Yeni Teklif</h1>
              <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                <Clock className="h-3 w-3" />
                Taslak
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="destructive" className="animate-pulse gap-1">
                <AlertCircle className="h-3 w-3" />
                Kaydedilmemiş değişiklikler
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={autoSaving}>
              {autoSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Taslak Kaydet
            </Button>
            <Button size="sm" onClick={() => {}} disabled={saving || !hasChanges}>
              <Send className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Kaydet ve Gönder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with improved spacing */}
      <div className="p-6">
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-0 bg-white/50 backdrop-blur-sm">
          <div className="p-8">
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

      {/* Auto-save notification */}
      {autoSaving && (
        <div className="fixed bottom-4 right-4 z-50">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-2 py-2 px-4">
            <Loader2 className="h-3 w-3 animate-spin" />
            Otomatik kaydediliyor...
          </Badge>
        </div>
      )}
    </DefaultLayout>
  );
};

export default ProposalCreate;
