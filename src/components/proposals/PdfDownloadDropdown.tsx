import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Printer, ChevronDown, Settings, Eye } from "lucide-react";
import { usePdfTemplates } from "@/hooks/usePdfTemplates";
import { TemplatePreview } from "@/components/pdf-templates/TemplatePreview";
import { Proposal } from "@/types/proposal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PdfDownloadDropdownProps {
  onDownloadWithTemplate: (templateId?: string) => void;
  proposal?: Proposal;
}

export const PdfDownloadDropdown: React.FC<PdfDownloadDropdownProps> = ({
  onDownloadWithTemplate,
  proposal
}) => {
  const { templates, selectedTemplateId, selectTemplate } = usePdfTemplates();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    selectTemplate(templateId);
    onDownloadWithTemplate(templateId);
  };

  const handleQuickDownload = () => {
    onDownloadWithTemplate(selectedTemplateId);
  };

  return (
    <div className="flex gap-2">
      {/* Quick Download with Selected Template */}
      <Button onClick={handleQuickDownload} className="gap-2">
        <Printer className="h-4 w-4" />
        PDF İndir
      </Button>

      {/* Template Selection Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
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
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{template.name}</span>
                  {selectedTemplateId === template.id && (
                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      Seçili
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {template.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Eye className="h-4 w-4 mr-2" />
                Şablonları Önizle
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>PDF Şablonları</DialogTitle>
              </DialogHeader>
              {proposal && (
                <TemplatePreview
                  proposal={proposal}
                  selectedTemplateId={selectedTemplateId}
                  onTemplateSelect={(templateId) => {
                    handleTemplateSelect(templateId);
                    setIsPreviewOpen(false);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};