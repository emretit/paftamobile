
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProposalTemplate } from "@/types/proposal-template";
import { FileText, BarChart3, Users, Building, Package } from "lucide-react";

interface ProposalTemplateGridProps {
  onSelectTemplate: (template: ProposalTemplate) => void;
  templates?: ProposalTemplate[];
}

const ProposalTemplateGrid: React.FC<ProposalTemplateGridProps> = ({ 
  onSelectTemplate,
  templates = defaultTemplates
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              {getTemplateIcon(template.templateType)}
            </div>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div className="space-y-1">
              {template.templateFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => onSelectTemplate(template)} 
              className="w-full"
            >
              Bu Şablonu Kullan
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Helper function to get the appropriate icon based on template type
const getTemplateIcon = (type: string) => {
  switch (type) {
    case "product":
      return <Package className="h-5 w-5 text-blue-500" />;
    case "service":
      return <FileText className="h-5 w-5 text-green-500" />;
    case "consulting":
      return <BarChart3 className="h-5 w-5 text-purple-500" />;
    case "company":
      return <Building className="h-5 w-5 text-red-500" />;
    case "enterprise":
      return <Users className="h-5 w-5 text-orange-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

// Default templates data
const defaultTemplates: ProposalTemplate[] = [
  {
    id: "template-1",
    name: "Ürün Teklifi",
    description: "Standart ürün satışı için teklif şablonu",
    templateType: "product",
    templateFeatures: [
      "Ürün listeleri için optimize edilmiş",
      "KDV dahil/hariç seçeneği",
      "İskonto alanları"
    ],
    items: [],
    prefilledFields: {
      title: "Ürün Teklifi",
      validityDays: 30,
      paymentTerm: "prepaid"
    }
  },
  {
    id: "template-2",
    name: "Hizmet Teklifi",
    description: "Danışmanlık ve hizmet sunumu için teklif şablonu",
    templateType: "service",
    templateFeatures: [
      "Saatlik hizmet bedeli formatında",
      "Proje zaman çizelgesi alanı",
      "Hizmet koşulları dahil"
    ],
    items: [],
    prefilledFields: {
      title: "Hizmet Teklifi",
      validityDays: 15,
      paymentTerm: "net30"
    }
  },
  {
    id: "template-3",
    name: "Kurumsal Teklif",
    description: "Kurumsal müşteriler için kapsamlı teklif şablonu",
    templateType: "enterprise",
    templateFeatures: [
      "Kurumsal müşteriler için özelleştirilmiş",
      "Detaylı ödeme planı",
      "Kurumsal sözleşme maddeleri"
    ],
    items: [],
    prefilledFields: {
      title: "Kurumsal Çözüm Teklifi",
      validityDays: 45,
      paymentTerm: "net60"
    }
  }
];

export default ProposalTemplateGrid;
