import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, ChevronDown, Settings } from "lucide-react";
import { ProposalTemplate } from "@/types/proposal-template";
import { useNavigate } from "react-router-dom";

interface PdfDownloadDropdownProps {
  onDownloadWithTemplate: (templateId?: string) => void;
  templates?: ProposalTemplate[];
}

const defaultTemplates: ProposalTemplate[] = [
  {
    id: "default",
    name: "Varsayılan Şablon",
    description: "Standart PDF şablonu",
    templateType: "standard",
    templateFeatures: [],
    items: []
  },
  {
    id: "modern",
    name: "Modern Şablon",
    description: "Modern tasarım şablonu",
    templateType: "modern",
    templateFeatures: [],
    items: []
  },
  {
    id: "minimal",
    name: "Minimal Şablon", 
    description: "Sade ve temiz şablon",
    templateType: "minimal",
    templateFeatures: [],
    items: []
  }
];

export const PdfDownloadDropdown: React.FC<PdfDownloadDropdownProps> = ({
  onDownloadWithTemplate,
  templates = defaultTemplates
}) => {
  const navigate = useNavigate();

  const handleTemplateSelect = (templateId: string) => {
    onDownloadWithTemplate(templateId);
  };

  const handleTemplateSettings = () => {
    navigate("/settings");
    // Şablonlar tab'ına geçiş için URL hash kullanabiliriz
    setTimeout(() => {
      const templatesTab = document.querySelector('[data-tab="templates"]');
      if (templatesTab) {
        (templatesTab as HTMLElement).click();
      }
    }, 100);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="h-4 w-4" />
          PDF İndir
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Şablon Seçin
        </div>
        <DropdownMenuSeparator />
        
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => handleTemplateSelect(template.id)}
            className="cursor-pointer"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{template.name}</span>
              <span className="text-xs text-muted-foreground">
                {template.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleTemplateSettings}
          className="cursor-pointer"
        >
          <Settings className="h-4 w-4 mr-2" />
          Şablon Ayarları
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};