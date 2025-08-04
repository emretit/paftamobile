import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import StandardProposalForm from "@/components/proposals/templates/form/enhanced/StandardProposalForm";
import { toast } from "sonner";

interface StandardProposalCreateProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const StandardProposalCreate: React.FC<StandardProposalCreateProps> = ({ 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get template and context info
  const templateId = searchParams.get('template_id');
  const customerId = searchParams.get('customer_id');
  const opportunityId = searchParams.get('opportunity_id');

  // Standard template data - in real app this would come from API
  const standardTemplate = {
    id: "template-standard",
    name: "Standart Teklif",
    description: "En popüler şablon - her türlü iş için uygun, kapsamlı ve profesyonel görünüm",
    templateType: "standard",
    templateFeatures: [
      "Profesyonel tasarım ve düzen",
      "Detaylı ürün/hizmet listesi",
      "Otomatik toplam hesaplama",
      "KDV dahil/hariç seçeneği",
      "Ödeme koşulları ve şartlar",
      "Şirket logosu ve bilgileri"
    ],
    items: [],
    prefilledFields: {
      title: "Teklif",
      validityDays: 30,
      paymentTerm: "net30"
    },
    popularity: 4.9,
    estimatedTime: "8 dk",
    usageCount: "15.2k"
  };

  const handleSaveDraft = () => {
    toast.success("Standart teklif başarıyla kaydedildi");
    navigate("/proposals");
  };

  const handlePreview = () => {
    toast.info("Önizleme açılıyor...");
  };

  const handleBack = () => {
    navigate("/proposals/templates");
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <div className="container mx-auto py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Şablon Seçimine Dön
          </Button>
        </div>

        {/* Enhanced Standard Form */}
        <StandardProposalForm
          template={standardTemplate}
          onSaveDraft={handleSaveDraft}
          onPreview={handlePreview}
        />
      </div>
    </DefaultLayout>
  );
};

export default StandardProposalCreate;