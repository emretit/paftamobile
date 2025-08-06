import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProposalTemplate } from "@/types/proposal-template";

interface TemplateSettingsProps {
  template: ProposalTemplate;
  onChange: (template: ProposalTemplate) => void;
}

export const TemplateSettings: React.FC<TemplateSettingsProps> = ({
  template,
  onChange,
}) => {
  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Şablon Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Şablon Adı</Label>
            <Input
              id="template-name"
              value={template.name}
              onChange={(e) => onChange({ ...template, name: e.target.value })}
              placeholder="Şablon adı girin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Açıklama</Label>
            <Input
              id="template-description"
              value={template.description || ""}
              onChange={(e) => onChange({ ...template, description: e.target.value })}
              placeholder="Şablon açıklaması girin"
            />
          </div>
        </CardContent>
      </Card>

      {/* Design Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tasarım Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ana Renk</Label>
            <Input
              type="color"
              defaultValue="#2563eb"
              className="w-full h-10"
            />
          </div>
          <div className="space-y-2">
            <Label>Font Ailesi</Label>
            <Input defaultValue="Inter" />
          </div>
          <div className="space-y-2">
            <Label>Sayfa Boyutu</Label>
            <Input defaultValue="A4" readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};