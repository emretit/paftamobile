
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProposalTemplate } from "@/types/proposal-template";
import { useProposalTemplates } from "@/hooks/useProposalTemplates";
import { FileText, FilePlus, Wrench } from "lucide-react";

interface ProposalTemplateGridProps {
  onSelectTemplate: (template: ProposalTemplate) => void;
}

const ProposalTemplateGrid: React.FC<ProposalTemplateGridProps> = ({ onSelectTemplate }) => {
  const { data: templates, isLoading } = useProposalTemplates();

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "file-text":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "wrench":
        return <Wrench className="h-8 w-8 text-indigo-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="h-24 bg-gray-200"></CardHeader>
          <CardContent className="h-20 mt-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </CardContent>
          <CardFooter className="h-12 bg-gray-100"></CardFooter>
        </Card>
      ))}
    </div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Şablon Seçin</h2>
        <p className="text-sm text-gray-600">Başlamak için aşağıdaki şablonlardan birini seçin</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                {getIconComponent(template.icon)}
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                  {template.category}
                </span>
              </div>
              <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
              <CardDescription className="line-clamp-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="text-xs text-gray-500">
                {template.items.length} kalem içeriyor
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => onSelectTemplate(template)}
                variant="outline"
              >
                Bu Şablonu Kullan
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {/* Empty Template Option */}
        <Card key="empty" className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <FilePlus className="h-8 w-8 text-gray-500" />
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                Boş
              </span>
            </div>
            <CardTitle className="text-lg mt-2">Boş Teklif</CardTitle>
            <CardDescription>Sıfırdan yeni bir teklif oluşturun.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <div className="text-xs text-gray-500">
              İçerik yok
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => onSelectTemplate({
                id: "empty",
                name: "Boş Teklif",
                description: "Sıfırdan yeni bir teklif oluşturun.",
                icon: "file-plus",
                category: "Boş",
                items: []
              })}
              variant="outline"
            >
              Boş Teklif Oluştur
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProposalTemplateGrid;
