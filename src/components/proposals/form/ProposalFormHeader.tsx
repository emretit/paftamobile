
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Proposal } from "@/types/proposal";

interface ProposalFormHeaderProps {
  proposal: Proposal | null;
  loading: boolean;
  saving: boolean;
  isNew: boolean;
  onSave: () => void;
  onBack: () => void;
}

const ProposalFormHeader = ({
  proposal,
  loading,
  saving,
  isNew,
  onSave,
  onBack,
}: ProposalFormHeaderProps) => {
  const getTitle = () => {
    if (loading) return <Skeleton className="h-8 w-40" />;
    return isNew ? "Yeni Teklif Oluştur" : `${proposal?.title || ""} Düzenle`;
  };

  const getButtonText = () => {
    return isNew ? "Teklif Oluştur" : "Değişiklikleri Kaydet";
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-2xl font-bold">
          {getTitle()}
        </h1>
      </div>
      <Button 
        onClick={onSave} 
        disabled={loading || saving}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Save className="h-4 w-4 mr-2" />
        {getButtonText()}
      </Button>
    </div>
  );
};

export default ProposalFormHeader;
