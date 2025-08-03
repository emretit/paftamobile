import React from "react";
import { TemplateField } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FieldEditorProps {
  field: TemplateField;
  onUpdate: (field: TemplateField) => void;
  onCancel: () => void;
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  onUpdate,
  onCancel,
}) => {
  const fieldTypes = [
    { value: 'text', label: 'Metin' },
    { value: 'number', label: 'Sayı' },
    { value: 'date', label: 'Tarih' },
    { value: 'select', label: 'Seçim Listesi' },
    { value: 'textarea', label: 'Uzun Metin' },
    { value: 'checkbox', label: 'Onay Kutusu' },
    { value: 'image', label: 'Resim' },
    { value: 'table', label: 'Tablo' },
  ];

  const alignmentOptions = [
    { value: 'left', label: 'Sol' },
    { value: 'center', label: 'Orta' },
    { value: 'right', label: 'Sağ' },
  ];

  const fontWeightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Kalın' },
  ];

  const updateField = (updates: Partial<TemplateField>) => {
    onUpdate({ ...field, ...updates });
  };

  const updateStyle = (styleUpdates: Partial<TemplateField['style']>) => {
    updateField({
      style: { ...field.style, ...styleUpdates },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Alan Düzenle: {field.label}</h3>
        <p className="text-sm text-muted-foreground">
          Alan özelliklerini ve görünümünü özelleştirin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Temel Ayarlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="field-label">Alan Adı</Label>
              <Input
                id="field-label"
                value={field.label}
                onChange={(e) => updateField({ label: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="field-key">Alan Anahtarı</Label>
              <Input
                id="field-key"
                value={field.key}
                onChange={(e) => updateField({ key: e.target.value })}
                placeholder="field_name"
              />
            </div>

            <div>
              <Label htmlFor="field-type">Alan Tipi</Label>
              <Select
                value={field.type}
                onValueChange={(type) => updateField({ type: type as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="field-required">Zorunlu Alan</Label>
              <Switch
                id="field-required"
                checked={field.required}
                onCheckedChange={(required) => updateField({ required })}
              />
            </div>

            <div>
              <Label htmlFor="field-default">Varsayılan Değer</Label>
              <Input
                id="field-default"
                value={field.defaultValue || ''}
                onChange={(e) => updateField({ defaultValue: e.target.value })}
                placeholder="Varsayılan değer"
              />
            </div>

            {field.type === 'select' && (
              <div>
                <Label htmlFor="field-options">Seçenekler</Label>
                <Textarea
                  id="field-options"
                  value={(field.options || []).join('\n')}
                  onChange={(e) => updateField({
                    options: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="Her satıra bir seçenek yazın"
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Style Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Görünüm Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="field-width">Genişlik</Label>
              <Input
                id="field-width"
                value={field.style?.width || ''}
                onChange={(e) => updateStyle({ width: e.target.value })}
                placeholder="100%, 200px, vb."
              />
            </div>

            <div>
              <Label htmlFor="field-alignment">Hizalama</Label>
              <Select
                value={field.style?.alignment || 'left'}
                onValueChange={(alignment) => updateStyle({ alignment: alignment as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alignmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="field-font-size">Font Boyutu</Label>
              <Input
                id="field-font-size"
                type="number"
                value={field.style?.fontSize || 12}
                onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
                min="8"
                max="72"
              />
            </div>

            <div>
              <Label htmlFor="field-font-weight">Font Kalınlığı</Label>
              <Select
                value={field.style?.fontWeight || 'normal'}
                onValueChange={(fontWeight) => updateStyle({ fontWeight: fontWeight as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeightOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="field-color">Metin Rengi</Label>
              <Input
                id="field-color"
                type="color"
                value={field.style?.color || '#000000'}
                onChange={(e) => updateStyle({ color: e.target.value })}
              />
            </div>

            <Separator />

            {/* Validation Settings */}
            <div>
              <h4 className="font-medium mb-3">Doğrulama Ayarları</h4>
              
              {(field.type === 'text' || field.type === 'number') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="field-min">Minimum Değer/Uzunluk</Label>
                    <Input
                      id="field-min"
                      type="number"
                      value={field.validation?.min || ''}
                      onChange={(e) => updateField({
                        validation: {
                          ...field.validation,
                          min: Number(e.target.value) || undefined,
                        },
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="field-max">Maksimum Değer/Uzunluk</Label>
                    <Input
                      id="field-max"
                      type="number"
                      value={field.validation?.max || ''}
                      onChange={(e) => updateField({
                        validation: {
                          ...field.validation,
                          max: Number(e.target.value) || undefined,
                        },
                      })}
                    />
                  </div>
                </div>
              )}

              {field.type === 'text' && (
                <div className="mt-3">
                  <Label htmlFor="field-pattern">Regex Deseni</Label>
                  <Input
                    id="field-pattern"
                    value={field.validation?.pattern || ''}
                    onChange={(e) => updateField({
                      validation: {
                        ...field.validation,
                        pattern: e.target.value,
                      },
                    })}
                    placeholder="^[A-Za-z]+$"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button onClick={() => onUpdate(field)}>
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  );
};