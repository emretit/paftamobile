import React, { useState } from "react";
import { TemplateSection } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface SectionEditorProps {
  section: TemplateSection;
  onSave: (section: TemplateSection) => void;
  onCancel: () => void;
  onAutoSave?: (section: TemplateSection) => void; // Otomatik kaydetme için
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onSave,
  onCancel,
  onAutoSave,
}) => {
  const [editedSection, setEditedSection] = useState<TemplateSection>({
    ...section,
    settings: section.settings || {}
  });

  const updateSectionSettings = (newSettings: Record<string, any>) => {
    const updatedSection = {
      ...editedSection,
      settings: { ...editedSection.settings, ...newSettings }
    };
    
    setEditedSection(updatedSection);
    
    // Otomatik kaydetme - toggle değişiklikleri anında uygulanır
    if (onAutoSave) {
      onAutoSave(updatedSection);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Bölüm Düzenle: {section.title}</h3>
          <p className="text-sm text-muted-foreground">
            Bölüm ayarlarını özelleştirin
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bölüm Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="section-title">Bölüm Başlığı</Label>
            <Input
              id="section-title"
              value={editedSection.title}
              onChange={(e) => setEditedSection({
                ...editedSection,
                title: e.target.value,
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="section-enabled">Bölümü Göster</Label>
            <Switch
              id="section-enabled"
              checked={editedSection.enabled}
              onCheckedChange={(enabled) => setEditedSection({
                ...editedSection,
                enabled,
              })}
            />
          </div>

          {section.type !== 'custom' && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">Sistem Bölümü</p>
              <p className="text-xs text-muted-foreground">
                Bu bölüm sistem tarafından yönetilir ve özelleştirilebilir.
              </p>
              <Badge variant="secondary" className="mt-2">
                {section.type}
              </Badge>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <Label>Bölüm Tipi Ayarları</Label>
            
            {section.type === 'header' && (
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Logo Göster</Label>
                  <Switch 
                    checked={editedSection.settings?.showLogo ?? true}
                    onCheckedChange={(checked) => updateSectionSettings({ showLogo: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Şirket Bilgileri Göster</Label>
                  <Switch 
                    checked={editedSection.settings?.showCompanyInfo ?? true}
                    onCheckedChange={(checked) => updateSectionSettings({ showCompanyInfo: checked })}
                  />
                </div>
              </div>
            )}

            {section.type === 'items-table' && (
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>Satır Renkli Arka Plan</Label>
                  <Switch 
                    checked={editedSection.settings?.alternatingRows ?? true}
                    onCheckedChange={(checked) => updateSectionSettings({ alternatingRows: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Ürün Resimleri Göster</Label>
                  <Switch 
                    checked={editedSection.settings?.showProductImages ?? false}
                    onCheckedChange={(checked) => updateSectionSettings({ showProductImages: checked })}
                  />
                </div>
              </div>
            )}

            {section.type === 'totals' && (
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label>KDV Detayını Göster</Label>
                  <Switch 
                    checked={editedSection.settings?.showTaxDetails ?? true}
                    onCheckedChange={(checked) => updateSectionSettings({ showTaxDetails: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>İndirim Satırını Göster</Label>
                  <Switch 
                    checked={editedSection.settings?.showDiscounts ?? false}
                    onCheckedChange={(checked) => updateSectionSettings({ showDiscounts: checked })}
                  />
                </div>
              </div>
            )}

            {section.type === 'custom' && (
              <div className="space-y-3 p-3 border rounded-lg">
                <div>
                  <Label>Özel İçerik</Label>
                  <Textarea
                    value={editedSection.settings?.customContent || ''}
                    onChange={(e) => updateSectionSettings({ customContent: e.target.value })}
                    placeholder="Bu bölümde gösterilecek özel içeriği girin..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Geri Dön
        </Button>
        <Button onClick={() => onSave(editedSection)}>
          Tamamla
        </Button>
      </div>
      
      {onAutoSave && (
        <div className="text-xs text-muted-foreground text-center">
          💡 Toggle değişiklikleri otomatik olarak kaydedilir
        </div>
      )}
    </div>
  );
};