
import React from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalEdit } from "@/hooks/useProposalEdit";
import UnifiedProposalForm from "@/components/proposals/form/UnifiedProposalForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const { proposal, loading, saving, handleBack, handleSave } = useProposalEdit();

  if (loading) {
    return (
      <DefaultLayout
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        title="Teklif Düzenle"
        subtitle="Teklif bilgilerini güncelleyin"
      >
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin"
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Teklife Dön
          </Button>
          <h1 className="text-2xl font-bold">
            Teklif Düzenle
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
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <Card className="p-6">
        <div id="proposal-form">
          <UnifiedProposalForm
            proposal={proposal}
            loading={loading}
            saving={saving}
            isNew={false}
            onSave={handleSave}
            onBack={handleBack}
            title="Teklif Düzenle"
            subtitle="Teklif bilgilerini güncelleyin"
          />
        </div>
      </Card>
    </DefaultLayout>
  );
};

export default ProposalEdit;
