import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Settings, Palette, Layout, Type, Image, FileText } from "lucide-react";
import { ProposalTemplate } from "@/types/proposal-template";
import { TemplateCanvas } from "./TemplateCanvas";
import { TemplateSettings } from "./TemplateSettings";
import { TemplatePreviewPanel } from "./TemplatePreviewPanel";
import { FieldPalette } from "./FieldPalette";

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
  const [activeTab, setActiveTab] = useState("design");
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
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
            onClick={() => setActiveTab("preview")}
            disabled={activeTab === "preview"}
          >
            <Eye className="w-4 h-4 mr-2" />
            Önizleme
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Tools */}
        <div className="w-80 border-r bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b p-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="design" className="p-2">
                  <Layout className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="style" className="p-2">
                  <Palette className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="fields" className="p-2">
                  <Type className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="preview" className="p-2">
                  <Eye className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="design" className="h-full m-0">
                <TemplateSettings
                  template={templateData}
                  onChange={setTemplateData}
                />
              </TabsContent>

              <TabsContent value="style" className="h-full m-0">
                <div className="p-4 space-y-6">
                  <h3 className="font-semibold mb-4">Stil Ayarları</h3>
                  {/* Color picker, font settings, etc. */}
                  <div className="space-y-4">
                    <div>
                      <Label>Ana Renk</Label>
                      <input
                        type="color"
                        value={templateData.designSettings?.colors?.primary || '#2563eb'}
                        onChange={(e) => {
                          const updatedTemplate = {
                            ...templateData,
                            designSettings: {
                              ...templateData.designSettings!,
                              colors: {
                                ...templateData.designSettings!.colors,
                                primary: e.target.value
                              }
                            }
                          };
                          setTemplateData(updatedTemplate);
                        }}
                        className="w-full h-10 rounded border"
                      />
                    </div>
                    <div>
                      <Label>İkincil Renk</Label>
                      <input
                        type="color"
                        value={templateData.designSettings?.colors?.secondary || '#64748b'}
                        onChange={(e) => {
                          const updatedTemplate = {
                            ...templateData,
                            designSettings: {
                              ...templateData.designSettings!,
                              colors: {
                                ...templateData.designSettings!.colors,
                                secondary: e.target.value
                              }
                            }
                          };
                          setTemplateData(updatedTemplate);
                        }}
                        className="w-full h-10 rounded border"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fields" className="h-full m-0">
                <FieldPalette
                  onAddField={(field) => {
                    console.log('Add field:', field);
                    // Field ekleme logic'i burada olacak
                  }}
                />
              </TabsContent>

              <TabsContent value="preview" className="h-full m-0 p-0">
                {/* Preview will be in main area */}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Main Canvas/Preview Area */}
        <div className="flex-1">
          {activeTab === "preview" ? (
            <TemplatePreviewPanel
              template={templateData}
              isFullscreen={isPreviewFullscreen}
              onToggleFullscreen={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
            />
          ) : (
            <div className="h-full flex">
              <div className="flex-1">
                <TemplateCanvas template={templateData} />
              </div>
              {/* Mini preview sidebar */}
              <div className="w-80 border-l bg-muted/30">
                <div className="p-4">
                  <h4 className="font-medium mb-3">Canlı Önizleme</h4>
                  <div className="aspect-[3/4] bg-white border rounded-lg overflow-hidden">
                    <div className="scale-[0.3] origin-top-left w-[300%] h-[300%]">
                      <TemplatePreviewPanel
                        template={templateData}
                        isFullscreen={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};