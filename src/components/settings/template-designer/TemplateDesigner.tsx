import React, { useState } from "react";
import { ProposalTemplate, TemplateDesignSettings } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TemplatePreview } from "./TemplatePreview";
import { VisualEditor } from "./VisualEditor";

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
  const [templateName, setTemplateName] = useState(template.name);
  const [templateDescription, setTemplateDescription] = useState(template.description || "");
  const [showPreview, setShowPreview] = useState(true);

  const handleSave = () => {
    const updatedTemplate = {
      ...template,
      name: templateName,
      description: templateDescription,
      designSettings,
    };
    onSave(updatedTemplate);
  };

  // Otomatik kaydetme için designSettings değiştiğinde çağrılır
  const handleSettingsChange = (newSettings: TemplateDesignSettings) => {
    setDesignSettings(newSettings);
    // Otomatik kaydetme - her değişiklikte Supabase'e kaydet
    const updatedTemplate = {
      ...template,
      name: templateName,
      description: templateDescription,
      designSettings: newSettings,
    };
    onSave(updatedTemplate);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      <div className="flex h-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-background border-b p-4">
          <div className="flex items-center justify-between">
            {/* Sol taraf - Navigasyon ve başlık */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>
              <div className="border-l pl-4">
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Şablon adı"
                  className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                />
                <Input
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Açıklama"
                  className="text-xs text-muted-foreground bg-transparent border-none p-0 h-auto focus-visible:ring-0 mt-1"
                />
              </div>
            </div>

            {/* Orta - Şablon bilgileri */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Şablon adı"
                  className="w-40 h-8 text-sm border-muted"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Açıklama"
                  className="w-56 h-8 text-sm border-muted"
                />
              </div>
            </div>

            {/* Sağ taraf - Aksiyonlar */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="h-8"
              >
                <Eye className="w-4 h-4 mr-1" />
                {showPreview ? "Gizle" : "Göster"}
              </Button>
              <Button onClick={handleSave} size="sm" className="h-8">
                Kaydet
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex pt-20">
        <div className="flex h-[calc(100%-80px)] w-full">
            <div className="w-96 border-r bg-card overflow-y-auto p-4">
              {/* Design Settings */}
              <VisualEditor
                designSettings={designSettings}
                onSettingsChange={handleSettingsChange}
              />
            </div>
            {showPreview && (
              <div className="flex-1 bg-muted/30 overflow-y-auto">
                <div className="p-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Canlı Önizleme
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
    branding: {
      companyName: 'Şirket Adı',
      tagline: 'Şirket slogan',
      website: 'www.sirket.com',
    },
    sections: [
      {
        id: 'header',
        type: 'header',
        title: 'Başlık',
        enabled: true,
        order: 0,
        settings: {},
      },
      {
        id: 'proposal-info',
        type: 'proposal-info',
        title: 'Teklif Bilgileri',
        enabled: true,
        order: 1,
        settings: {},
      },
      {
        id: 'customer-info',
        type: 'customer-info',
        title: 'Müşteri Bilgileri',
        enabled: true,
        order: 2,
        settings: {},
      },
      {
        id: 'items-table',
        type: 'items-table',
        title: 'Teklif Kalemleri',
        enabled: true,
        order: 3,
        settings: {},
      },
      {
        id: 'totals',
        type: 'totals',
        title: 'Toplam',
        enabled: true,
        order: 4,
        settings: {},
      },
      {
        id: 'terms',
        type: 'terms',
        title: 'Şartlar',
        enabled: true,
        order: 5,
        settings: {},
      },
      {
        id: 'footer',
        type: 'footer',
        title: 'Alt Bilgi',
        enabled: true,
        order: 6,
        settings: {},
      },
    ],
  };
}