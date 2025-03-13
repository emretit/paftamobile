
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Send } from "lucide-react";

interface ProposalFormActionsProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ProposalFormActions = ({
  onBack,
  onSaveDraft,
  onSubmit,
  isLoading,
}: ProposalFormActionsProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Yeni Teklif Oluştur
        </h1>
        <p className="text-gray-600 mt-1">
          Müşterileriniz için yeni bir teklif hazırlayın
        </p>
      </div>
      <div className="flex space-x-2 self-end md:self-auto">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </div>
    </div>
  );
};

export default ProposalFormActions;
