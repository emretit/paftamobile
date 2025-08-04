import React from "react";
import { TemplateDesignSettings } from "@/types/proposal-template";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTemplateLogoUpload } from "@/hooks/useTemplateLogoUpload";
import { Upload, X } from "lucide-react";

interface DesignSidebarProps {
  designSettings: TemplateDesignSettings;
  onSettingsChange: (settings: TemplateDesignSettings) => void;
}

export const DesignSidebar: React.FC<DesignSidebarProps> = ({
  designSettings,
  onSettingsChange,
}) => {
  const { uploadTemplateLogo, deleteTemplateLogo, uploading } = useTemplateLogoUpload();

  const updateSettings = (path: string, value: any) => {
    const pathArray = path.split('.');
    const newSettings = { ...designSettings };
    let current: any = newSettings;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    onSettingsChange(newSettings);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadTemplateLogo(file);
    if (url) {
      updateSettings('branding.logo', url);
    }
  };

  const removeLogo = async () => {
    if (designSettings.branding?.logo) {
      const deleted = await deleteTemplateLogo(designSettings.branding.logo);
      if (deleted) {
        updateSettings('branding.logo', undefined);
      }
    } else {
      updateSettings('branding.logo', undefined);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tasarım Ayarları</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["branding", "page", "colors", "layout"]}>
            {/* Logo/Branding Settings */}
            <AccordionItem value="branding">
              <AccordionTrigger>Logo ve Marka</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Şablon Logosu</Label>
                  
                  {designSettings.branding?.logo ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <img 
                          src={designSettings.branding.logo} 
                          alt="Logo" 
                          className="h-12 w-auto object-contain"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeLogo}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-lg">
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Logo yüklemek için tıklayın
                          </p>
                          <label className="cursor-pointer">
                            <Button variant="outline" size="sm" disabled={uploading} asChild>
                              <span>
                                {uploading ? "Yükleniyor..." : "Logo Seç"}
                              </span>
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Şirket Adı</Label>
                    <Input
                      value={designSettings.branding?.companyName || ''}
                      onChange={(e) => updateSettings('branding.companyName', e.target.value)}
                      placeholder="Şirket adını girin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Slogan (İsteğe bağlı)</Label>
                    <Input
                      value={designSettings.branding?.tagline || ''}
                      onChange={(e) => updateSettings('branding.tagline', e.target.value)}
                      placeholder="Slogan girin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Website (İsteğe bağlı)</Label>
                    <Input
                      value={designSettings.branding?.website || ''}
                      onChange={(e) => updateSettings('branding.website', e.target.value)}
                      placeholder="www.sirketiniz.com"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Page Settings */}
            <AccordionItem value="page">
              <AccordionTrigger>Sayfa Ayarları</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Sayfa Boyutu</Label>
                  <Select
                    value={designSettings.pageSize}
                    onValueChange={(value) => updateSettings('pageSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Yönlendirme</Label>
                  <Select
                    value={designSettings.orientation}
                    onValueChange={(value) => updateSettings('orientation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Dikey</SelectItem>
                      <SelectItem value="landscape">Yatay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Üst Kenar</Label>
                    <Input
                      type="number"
                      value={designSettings.margins.top}
                      onChange={(e) => updateSettings('margins.top', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Alt Kenar</Label>
                    <Input
                      type="number"
                      value={designSettings.margins.bottom}
                      onChange={(e) => updateSettings('margins.bottom', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Sol Kenar</Label>
                    <Input
                      type="number"
                      value={designSettings.margins.left}
                      onChange={(e) => updateSettings('margins.left', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Sağ Kenar</Label>
                    <Input
                      type="number"
                      value={designSettings.margins.right}
                      onChange={(e) => updateSettings('margins.right', Number(e.target.value))}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Header Settings */}
            <AccordionItem value="header">
              <AccordionTrigger>Başlık Ayarları</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Başlığı Göster</Label>
                  <Switch
                    checked={designSettings.header.enabled}
                    onCheckedChange={(checked) => updateSettings('header.enabled', checked)}
                  />
                </div>

                {designSettings.header.enabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Logo Pozisyonu</Label>
                      <Select
                        value={designSettings.header.logoPosition}
                        onValueChange={(value) => updateSettings('header.logoPosition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Sol</SelectItem>
                          <SelectItem value="center">Orta</SelectItem>
                          <SelectItem value="right">Sağ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Logo Boyutu</Label>
                      <Select
                        value={designSettings.header.logoSize}
                        onValueChange={(value) => updateSettings('header.logoSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Küçük</SelectItem>
                          <SelectItem value="medium">Orta</SelectItem>
                          <SelectItem value="large">Büyük</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Şirket Bilgilerini Göster</Label>
                      <Switch
                        checked={designSettings.header.showCompanyInfo}
                        onCheckedChange={(checked) => updateSettings('header.showCompanyInfo', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Arka Plan Rengi</Label>
                      <Input
                        type="color"
                        value={designSettings.header.backgroundColor}
                        onChange={(e) => updateSettings('header.backgroundColor', e.target.value)}
                      />
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Colors */}
            <AccordionItem value="colors">
              <AccordionTrigger>Renkler</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Ana Renk</Label>
                    <Input
                      type="color"
                      value={designSettings.colors.primary}
                      onChange={(e) => updateSettings('colors.primary', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>İkincil Renk</Label>
                    <Input
                      type="color"
                      value={designSettings.colors.secondary}
                      onChange={(e) => updateSettings('colors.secondary', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Vurgu Rengi</Label>
                    <Input
                      type="color"
                      value={designSettings.colors.accent}
                      onChange={(e) => updateSettings('colors.accent', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Metin Rengi</Label>
                    <Input
                      type="color"
                      value={designSettings.colors.text}
                      onChange={(e) => updateSettings('colors.text', e.target.value)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Fonts */}
            <AccordionItem value="fonts">
              <AccordionTrigger>Yazı Tipleri</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Ana Font</Label>
                  <Select
                    value={designSettings.fonts.primary}
                    onValueChange={(value) => updateSettings('fonts.primary', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Başlık Boyutu</Label>
                    <Input
                      type="number"
                      value={designSettings.fonts.sizes.title}
                      onChange={(e) => updateSettings('fonts.sizes.title', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Metin Boyutu</Label>
                    <Input
                      type="number"
                      value={designSettings.fonts.sizes.body}
                      onChange={(e) => updateSettings('fonts.sizes.body', Number(e.target.value))}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Table Settings */}
            <AccordionItem value="table">
              <AccordionTrigger>Tablo Ayarları</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Başlık Arka Plan</Label>
                  <Input
                    type="color"
                    value={designSettings.table.headerBackground}
                    onChange={(e) => updateSettings('table.headerBackground', e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Alternatif Satır Renkleri</Label>
                  <Switch
                    checked={designSettings.table.rowAlternating}
                    onCheckedChange={(checked) => updateSettings('table.rowAlternating', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kenarlık Rengi</Label>
                  <Input
                    type="color"
                    value={designSettings.table.borderColor}
                    onChange={(e) => updateSettings('table.borderColor', e.target.value)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Layout */}
            <AccordionItem value="layout">
              <AccordionTrigger>Düzen</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Boşluk</Label>
                  <Select
                    value={designSettings.layout.spacing}
                    onValueChange={(value) => updateSettings('layout.spacing', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Sıkışık</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="spacious">Geniş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Kenarlıkları Göster</Label>
                  <Switch
                    checked={designSettings.layout.showBorders}
                    onCheckedChange={(checked) => updateSettings('layout.showBorders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Yuvarlatılmış Köşeler</Label>
                  <Switch
                    checked={designSettings.layout.roundedCorners}
                    onCheckedChange={(checked) => updateSettings('layout.roundedCorners', checked)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};