import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ProposalTemplate } from "@/types/proposal-template";
import ProposalTemplateGrid from "@/components/proposals/templates/ProposalTemplateGrid";
import { toast } from "sonner";

interface TemplateSelectionProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({ 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get context parameters
  const customerId = searchParams.get('customer_id');
  const opportunityId = searchParams.get('opportunity_id');

  const handleSelectTemplate = (template: ProposalTemplate) => {
    // Create URL parameters for proposal creation
    const params = new URLSearchParams();
    params.set('template_id', template.id);
    
    if (customerId) params.set('customer_id', customerId);
    if (opportunityId) params.set('opportunity_id', opportunityId);

    // Navigate to appropriate form based on template type
    if (template.templateType === 'standard') {
      // Use the enhanced standard form
      navigate(`/proposals/create/standard?${params.toString()}`);
    } else {
      // Use regular proposal creation form
      navigate(`/proposals/create?${params.toString()}`);
    }

    toast.success(`${template.name} şablonu seçildi`);
  };

  const handleBack = () => {
    navigate("/proposals");
  };

  return (
    <DefaultLayout 
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Teklif Şablonu Seçin
              </h1>
              <p className="text-gray-600">
                İhtiyacınıza en uygun şablonu seçerek profesyonel teklifler oluşturun
              </p>
            </div>
          </div>
        </div>

        {/* Context Info */}
        {(customerId || opportunityId) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Bağlam Bilgisi</span>
            </div>
            <div className="text-blue-700 text-sm mt-1">
              {customerId && <span>Müşteri: {customerId} • </span>}
              {opportunityId && <span>Fırsat: {opportunityId}</span>}
              <br />
              Seçtiğiniz şablon bu bilgilerle önceden doldurulacaktır.
            </div>
          </div>
        )}

        {/* Template Grid */}
        <ProposalTemplateGrid onSelectTemplate={handleSelectTemplate} />
      </div>
    </DefaultLayout>
  );
};

export default TemplateSelection;