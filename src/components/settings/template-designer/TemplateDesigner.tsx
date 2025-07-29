import React, { useState } from "react";
import { ProposalTemplate, TemplateDesignSettings } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye } from "lucide-react";
import { DesignSidebar } from "./DesignSidebar";
import { TemplatePreview } from "./TemplatePreview";

interface TemplateDesignerProps {
  template: ProposalTemplate;
  onSave: (template: ProposalTemplate) => void;
  onCancel: () => void;
}

export const TemplateDesigner: React.FC<TemplateDesignerProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const [designSettings, setDesignSettings] = useState<TemplateDesignSettings>(
    template.designSettings || getDefaultDesignSettings()
  );
  const [showPreview, setShowPreview] = useState(true);

  const handleSave = () => {
    const updatedTemplate = {
      ...template,
      designSettings,
    };
    onSave(updatedTemplate);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="flex h-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{template.name} - Şablon Tasarlayıcısı</h1>
                <p className="text-sm text-muted-foreground">PDF şablonunuzu özelleştirin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Önizlemeyi Gizle" : "Önizleme Göster"}
              </Button>
              <Button onClick={handleSave}>
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex pt-20">
          {/* Design Sidebar */}
          <div className="w-80 border-r bg-card overflow-y-auto">
            <DesignSidebar
              designSettings={designSettings}
              onSettingsChange={setDesignSettings}
            />
          </div>

          {/* Preview Area */}
          {showPreview && (
            <div className="flex-1 bg-muted/30 overflow-y-auto">
              <div className="p-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Önizleme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TemplatePreview
                      template={template}
                      designSettings={designSettings}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getDefaultDesignSettings(): TemplateDesignSettings {
  return {
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    header: {
      enabled: true,
      height: 60,
      logoPosition: 'left',
      logoSize: 'medium',
      showCompanyInfo: true,
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
    footer: {
      enabled: true,
      height: 40,
      showPageNumbers: true,
      showContactInfo: true,
      backgroundColor: '#f8f9fa',
      textColor: '#6c757d',
    },
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#3b82f6',
      text: '#1e293b',
      background: '#ffffff',
      border: '#e2e8f0',
    },
    fonts: {
      primary: 'Inter',
      secondary: 'Arial',
      sizes: { title: 24, heading: 18, body: 12, small: 10 },
    },
    table: {
      headerBackground: '#f8f9fa',
      headerText: '#1e293b',
      rowAlternating: true,
      borderColor: '#e2e8f0',
      borderWidth: 1,
    },
    layout: {
      spacing: 'normal',
      showBorders: true,
      roundedCorners: false,
      shadowEnabled: false,
    },
  };
}