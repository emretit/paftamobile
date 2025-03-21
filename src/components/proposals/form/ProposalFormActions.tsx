
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ProposalFormActionsProps {
  isNew: boolean;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
}

const ProposalFormActions = ({
  isNew,
  saving,
  onSave,
  onBack
}: ProposalFormActionsProps) => {
  const getButtonText = () => {
    return isNew ? "Teklif Oluştur" : "Değişiklikleri Kaydet";
  };

  return (
    <div className="flex justify-end space-x-4">
      <Button variant="outline" onClick={onBack}>
        İptal
      </Button>
      <Button 
        onClick={onSave} 
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Save className="h-4 w-4 mr-2" />
        {getButtonText()}
      </Button>
    </div>
  );
};

export default ProposalFormActions;
