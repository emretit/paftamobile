
import React from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { Proposal } from "@/types/proposal";

export interface ProposalFormHeaderProps {
  title: string;
  subtitle?: string;
  proposal?: Proposal | null;
  loading: boolean;
  saving: boolean;
  isNew: boolean;
  onSave?: () => void;
  onBack?: () => void;
}

const ProposalFormHeader = ({ 
  title, 
  subtitle,
  proposal, 
  loading, 
  saving, 
  isNew,
  onSave,
  onBack 
}: ProposalFormHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={onBack}
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Heading
            title={title}
            description={subtitle || (isNew ? "Yeni teklif oluşturun" : "Teklif bilgilerini güncelleyin")}
          />
        </div>

        {!loading && onSave && (
          <Button 
            onClick={onSave}
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? "Kaydediliyor..." : (isNew ? "Teklifi Oluştur" : "Değişiklikleri Kaydet")}
          </Button>
        )}
      </div>
      <Separator />
    </div>
  );
};

export default ProposalFormHeader;
