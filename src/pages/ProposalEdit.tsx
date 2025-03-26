
import React from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useProposalForm } from "@/hooks/useProposalForm";
import ProposalForm from "@/components/proposals/form/ProposalForm";
import { useProposalEdit } from "@/hooks/useProposalEdit";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProposalEditProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalEdit = ({ isCollapsed, setIsCollapsed }: ProposalEditProps) => {
  const { proposal, loading, saving, handleBack, handleSave } = useProposalEdit();
  const { isLoading: isSaving } = useProposalForm();

  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Teklif Düzenle"
      subtitle="Teklif bilgilerini güncelleyin"
    >
      <div className="container mx-auto pb-16">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Teklife Dön
          </Button>
        </div>
        
        <Card className="p-6">
          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <ProposalForm
              proposal={proposal}
              loading={loading}
              saving={saving || isSaving}
              isNew={false}
              onSave={handleSave}
              onBack={handleBack}
              title="Teklif Düzenle"
              subtitle="Teklif bilgilerini güncelleyin"
            />
          )}
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ProposalEdit;
