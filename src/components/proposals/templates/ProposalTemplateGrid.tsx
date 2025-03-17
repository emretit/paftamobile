
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProposalTemplate } from "@/types/proposal-template";
import { FileText, FileCheck, Clock, Users, Package } from "lucide-react";

interface ProposalTemplateGridProps {
  templates: ProposalTemplate[];
  onSelectTemplate: (template: ProposalTemplate) => void;
}

// Sample template data
const sampleTemplates: ProposalTemplate[] = [
  {
    id: "1",
    name: "Standart Hizmet Teklifi",
    description: "Genel hizmetler için standart teklif şablonu",
    templateType: "service",
    templateFeatures: ["Detaylı hizmet açıklamaları", "Standart ödeme koşulları", "Profesyonel görünüm"]
  },
  {
    id: "2",
    name: "Ürün Satış Teklifi",
    description: "Ürün satışları için kapsamlı teklif şablonu",
    templateType: "product",
    templateFeatures: ["Ürün özellikleri", "Miktar ve fiyat tablosu", "Teslimat şartları"]
  },
  {
    id: "3",
    name: "Bakım Anlaşması",
    description: "Düzenli bakım hizmetleri için teklif şablonu",
    templateType: "maintenance",
    templateFeatures: ["Bakım programı", "SLA detayları", "Periyodik kontroller", "Yedek parça politikası"]
  },
  {
    id: "4",
    name: "Kurumsal Çözüm Teklifi",
    description: "Büyük kurumsal müşteriler için özel teklif şablonu",
    templateType: "corporate",
    templateFeatures: ["Kapsamlı çözüm açıklaması", "Proje takvimi", "Referanslar", "Özel fiyatlandırma"]
  }
];

const ProposalTemplateGrid: React.FC<ProposalTemplateGridProps> = ({ onSelectTemplate }) => {
  // Function to get icon based on template type
  const getTemplateIcon = (type: string) => {
    switch (type) {
      case "service":
        return <FileCheck className="h-10 w-10 text-blue-500" />;
      case "product":
        return <Package className="h-10 w-10 text-green-500" />;
      case "maintenance":
        return <Clock className="h-10 w-10 text-orange-500" />;
      case "corporate":
        return <Users className="h-10 w-10 text-purple-500" />;
      default:
        return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sampleTemplates.map((template) => (
        <Card key={template.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              {getTemplateIcon(template.templateType)}
              <Button variant="ghost" size="sm">
                Önizle
              </Button>
            </div>
            <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <ul className="text-sm space-y-1 text-gray-600">
              {template.templateFeatures.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></div>
                  {feature}
                </li>
              ))}
              {template.templateFeatures.length > 3 && (
                <li className="text-xs text-gray-500 italic">
                  +{template.templateFeatures.length - 3} daha fazla özellik
                </li>
              )}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="default"
              onClick={() => onSelectTemplate(template)}
            >
              Bu Şablonu Kullan
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProposalTemplateGrid;
