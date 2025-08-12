import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { CustomTextField } from '@/types/pdf-template';
import { v4 as uuidv4 } from 'uuid';

interface CustomTextFieldsProps {
  fields: CustomTextField[];
  onFieldsChange: (fields: CustomTextField[]) => void;
}

export const CustomTextFields: React.FC<CustomTextFieldsProps> = ({
  fields,
  onFieldsChange,
}) => {
  const addField = () => {
    const newField: CustomTextField = {
      id: uuidv4(),
      label: 'Yeni Alan',
      text: '',
      position: 'footer',
      style: {
        fontSize: 12,
        align: 'left',
        bold: false,
        color: '#000000',
      },
    };
    onFieldsChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<CustomTextField>) => {
    onFieldsChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const updateFieldStyle = (id: string, styleUpdates: Partial<CustomTextField['style']>) => {
    onFieldsChange(
      fields.map((field) =>
        field.id === id 
          ? { ...field, style: { ...field.style, ...styleUpdates } }
          : field
      )
    );
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter((field) => field.id !== id));
  };

  const getPositionLabel = (position: CustomTextField['position']) => {
    switch (position) {
      case 'header': return 'Başlık';
      case 'footer': return 'Alt Bilgi';
      case 'before-table': return 'Tablo Öncesi';
      case 'after-table': return 'Tablo Sonrası';
      default: return position;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Özel Metin Alanları</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addField}
        >
          <Plus className="h-4 w-4 mr-2" />
          Alan Ekle
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Henüz özel metin alanı eklenmemiş</p>
          <p className="text-sm">Özel metinler eklemek için "Alan Ekle" butonunu kullanın</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <Card key={field.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{field.label}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(field.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Alan Adı</Label>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Alan adı"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Konum</Label>
                    <Select
                      value={field.position}
                      onValueChange={(value) => updateField(field.id, { position: value as CustomTextField['position'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Başlık</SelectItem>
                        <SelectItem value="before-table">Tablo Öncesi</SelectItem>
                        <SelectItem value="after-table">Tablo Sonrası</SelectItem>
                        <SelectItem value="footer">Alt Bilgi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Metin İçeriği</Label>
                  <Textarea
                    value={field.text}
                    onChange={(e) => updateField(field.id, { text: e.target.value })}
                    placeholder="Metin içeriği..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs">Font Boyutu</Label>
                    <Input
                      type="number"
                      min="8"
                      max="24"
                      value={field.style?.fontSize || 12}
                      onChange={(e) => updateFieldStyle(field.id, { fontSize: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Hizalama</Label>
                    <Select
                      value={field.style?.align || 'left'}
                      onValueChange={(value) => updateFieldStyle(field.id, { align: value as 'left' | 'center' | 'right' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">
                          <div className="flex items-center">
                            <AlignLeft className="h-4 w-4 mr-2" />
                            Sol
                          </div>
                        </SelectItem>
                        <SelectItem value="center">
                          <div className="flex items-center">
                            <AlignCenter className="h-4 w-4 mr-2" />
                            Orta
                          </div>
                        </SelectItem>
                        <SelectItem value="right">
                          <div className="flex items-center">
                            <AlignRight className="h-4 w-4 mr-2" />
                            Sağ
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Renk</Label>
                    <Input
                      type="color"
                      value={field.style?.color || '#000000'}
                      onChange={(e) => updateFieldStyle(field.id, { color: e.target.value })}
                      className="h-9 p-1"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.style?.bold || false}
                        onCheckedChange={(checked) => updateFieldStyle(field.id, { bold: checked })}
                      />
                      <Label className="text-xs">Kalın</Label>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Konum: {getPositionLabel(field.position)}
                  {field.text && (
                    <div className="mt-1 p-2 bg-muted/50 rounded text-foreground">
                      Önizleme: {field.text.substring(0, 50)}{field.text.length > 50 ? '...' : ''}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};