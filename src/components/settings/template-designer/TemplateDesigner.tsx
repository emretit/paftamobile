import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Eye, Settings } from "lucide-react";
import { ProposalTemplate } from "@/types/proposal-template";
import { TemplateCanvas } from "./TemplateCanvas";
import { TemplateSettings } from "./TemplateSettings";

interface TemplateDesignerProps {
  template?: ProposalTemplate;
  onSave: (template: ProposalTemplate) => void;
  onCancel: () => void;
}

export const TemplateDesigner: React.FC<TemplateDesignerProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const [templateName, setTemplateName] = useState(template?.name || "Yeni Şablon");
  const [templateDescription, setTemplateDescription] = useState(template?.description || "");
  const [showSettings, setShowSettings] = useState(false);
  const [templateData, setTemplateData] = useState<ProposalTemplate>(template || {
    id: crypto.randomUUID(),
    name: "Yeni Şablon",
    description: "",
    templateType: "standard",
    templateFeatures: ["header", "customer", "items", "totals", "terms"],
    items: [],
    designSettings: {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      header: {
        enabled: true,
        height: 80,
        logoPosition: 'left',
        logoSize: 'medium',
        showCompanyInfo: true,
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
      },
      footer: {
        enabled: false,
        height: 50,
        showPageNumbers: false,
        showContactInfo: false,
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
      },
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9',
        text: '#1f2937',
        background: '#ffffff',
        border: '#e5e7eb',
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Inter',
        sizes: { title: 32, heading: 24, body: 14, small: 12 },
      },
      table: {
        headerBackground: '#f8fafc',
        headerText: '#374151',
        rowAlternating: true,
        borderColor: '#e5e7eb',
        borderWidth: 1,
      },
      layout: {
        spacing: 'normal',
        showBorders: true,
        roundedCorners: true,
        shadowEnabled: false,
      },
      branding: {
        companyName: 'Şirket Adı',
        tagline: 'Profesyonel Hizmetler',
        website: 'www.sirket.com',
      },
      sections: [
        { id: 'header', type: 'header', title: 'Başlık', enabled: true, order: 1, settings: {} },
        { id: 'customer', type: 'customer-info', title: 'Müşteri Bilgileri', enabled: true, order: 2, settings: {} },
        { id: 'items', type: 'items-table', title: 'Kalemler', enabled: true, order: 3, settings: {} },
        { id: 'totals', type: 'totals', title: 'Toplamlar', enabled: true, order: 4, settings: {} },
        { id: 'terms', type: 'terms', title: 'Şartlar', enabled: true, order: 5, settings: {} },
      ],
    },
  });

  const handleSave = () => {
    const updatedTemplate = {
      ...templateData,
      name: templateName,
      description: templateDescription,
      updated_at: new Date().toISOString(),
    };
    onSave(updatedTemplate);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
              placeholder="Şablon adı"
            />
            <Textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="text-sm text-muted-foreground border-none p-0 h-auto bg-transparent resize-none"
              placeholder="Şablon açıklaması"
              rows={1}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Ayarlar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 border-r bg-card">
            <TemplateSettings
              template={templateData}
              onChange={setTemplateData}
            />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1">
          <TemplateCanvas template={templateData} />
        </div>
      </div>
    </div>
  );
};