
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
  title: string;
}

const ProposalFormHeader = ({
  proposal,
  loading,
  saving,
  isNew,
  onSave,
  onBack,
  title,
}: ProposalFormHeaderProps) => {
  const getTitle = () => {
    if (loading) return <Skeleton className="h-8 w-40" />;
    return title || (isNew ? "Yeni Teklif Oluştur" : `${proposal?.title || ""} Düzenle`);
  };

  const getButtonText = () => {
    return isNew ? "Teklif Oluştur" : "Değişiklikleri Kaydet";
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBack} className="dark:bg-gray-800 dark:border-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-2xl font-bold dark:text-white">
          {getTitle()}
        </h1>
      </div>
      <Button 
        onClick={onSave} 
        disabled={loading || saving}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <Save className="h-4 w-4 mr-2" />
        {getButtonText()}
      </Button>
    </div>
  );
};

export default ProposalFormHeader;
