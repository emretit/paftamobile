
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";

interface ProposalFormHeaderProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const ProposalFormHeader = ({ onSaveDraft, onSubmit, isLoading }: ProposalFormHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Yeni Teklif
        </h1>
        <p className="text-gray-600 mt-1">Yeni bir teklif oluştur</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onSaveDraft}
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          Taslak Kaydet
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={isLoading}
        >
          <FileText className="w-4 h-4 mr-2" />
          Teklif Oluştur
        </Button>
      </div>
    </div>
  );
};

export default ProposalFormHeader;
