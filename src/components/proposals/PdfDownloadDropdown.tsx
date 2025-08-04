import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Printer, ChevronDown, Settings, Loader2 } from "lucide-react";
import { ProposalTemplate } from "@/types/proposal-template";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PdfDownloadDropdownProps {
  onDownloadWithTemplate: (templateId?: string) => void;
}

export const PdfDownloadDropdown: React.FC<PdfDownloadDropdownProps> = ({
  onDownloadWithTemplate
}) => {
  const navigate = useNavigate();

  // Fetch templates from Supabase
  const { data: templates, isLoading } = useQuery({
    queryKey: ['proposal-templates'],
    queryFn: async (): Promise<ProposalTemplate[]> => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data?.map(template => ({
        id: template.id,
        name: template.name || '',
        description: template.description || '',
        templateType: template.template_type || 'standard',
        templateFeatures: [],
        items: [],
        designSettings: template.design_settings as any
      })) || [];
    }
  });

  // Default template if no templates are found
  const defaultTemplate: ProposalTemplate = {
    id: "default",
    name: "Varsayılan Şablon",
    description: "Standart PDF şablonu",
    templateType: "standard",
    templateFeatures: [],
    items: []
  };

  const templatesWithDefault = templates && templates.length > 0 
    ? [defaultTemplate, ...templates]
    : [defaultTemplate];

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
        <Button variant="outline" className="gap-2" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          PDF Yazdır
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Şablon Seçin
        </div>
        <DropdownMenuSeparator />
        
        {templatesWithDefault.map((template) => (
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