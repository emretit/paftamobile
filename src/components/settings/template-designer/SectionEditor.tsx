import React, { useState } from "react";
import { TemplateSection, TemplateField } from "@/types/proposal-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Settings, 
  Type, 
  Hash, 
  Calendar, 
  Image,
  CheckSquare,
  FileText,
  List,
  ToggleLeft
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface SectionEditorProps {
  section: TemplateSection;
  onSave: (section: TemplateSection) => void;
  onCancel: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onSave,
  onCancel,
}) => {
  const [editedSection, setEditedSection] = useState<TemplateSection>({
    ...section,
    fields: section.fields || [],
  });
  const [editingField, setEditingField] = useState<TemplateField | null>(null);

  const fieldTypes = [
    { value: 'text', label: 'Metin', icon: Type },
    { value: 'number', label: 'Sayı', icon: Hash },
    { value: 'date', label: 'Tarih', icon: Calendar },
    { value: 'select', label: 'Seçim Listesi', icon: List },
    { value: 'textarea', label: 'Uzun Metin', icon: FileText },
    { value: 'checkbox', label: 'Onay Kutusu', icon: CheckSquare },
    { value: 'image', label: 'Resim', icon: Image },
    { value: 'table', label: 'Tablo', icon: ToggleLeft },
  ];

  const addField = () => {
    const newField: TemplateField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'Yeni Alan',
      key: `field_${Date.now()}`,
      required: false,
      style: {
        fontSize: 12,
        fontWeight: 'normal',
        alignment: 'left',
      },
    };

    setEditedSection({
      ...editedSection,
      fields: [...(editedSection.fields || []), newField],
    });
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    const updatedFields = (editedSection.fields || []).map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );

    setEditedSection({
      ...editedSection,
      fields: updatedFields,
    });
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = (editedSection.fields || []).filter(field => field.id !== fieldId);
    setEditedSection({
      ...editedSection,
      fields: updatedFields,
    });
  };

  const handleFieldDragEnd = (result: any) => {
    if (!result.destination) return;

    const fields = Array.from(editedSection.fields || []);
    const [reorderedField] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, reorderedField);

    setEditedSection({
      ...editedSection,
      fields,
    });
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType ? fieldType.icon : Type;
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
            Bölüm ayarlarını ve alanlarını özelleştirin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Settings */}
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
                  Bu bölüm sistem tarafından yönetilir ve tür değiştirilemez.
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Alanlar ({(editedSection.fields || []).length})</Label>
                <Button onClick={addField} size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Alan Ekle
                </Button>
              </div>

              {editedSection.fields && editedSection.fields.length > 0 && (
                <DragDropContext onDragEnd={handleFieldDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {editedSection.fields.map((field, index) => {
                          const IconComponent = getFieldIcon(field.type);
                          return (
                            <Draggable
                              key={field.id}
                              draggableId={field.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="flex items-center gap-2 p-2 bg-muted/30 rounded border"
                                >
                                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                                  <span className="flex-1 text-sm">{field.label}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {field.type}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteField(field.id)}
                                    className="h-6 w-6 p-0 text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Field Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hızlı Alan Düzenleyici</CardTitle>
          </CardHeader>
          <CardContent>
            {editedSection.fields && editedSection.fields.length > 0 ? (
              <div className="space-y-4">
                <Select
                  value={editingField?.id || ''}
                  onValueChange={(fieldId) => {
                    const field = editedSection.fields?.find(f => f.id === fieldId);
                    setEditingField(field || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Düzenlenecek alanı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {editedSection.fields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.label} ({field.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {editingField && (
                  <div className="space-y-3 p-3 border rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Alan Adı</Label>
                        <Input
                          value={editingField.label}
                          onChange={(e) => updateField(editingField.id, { label: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Alan Tipi</Label>
                        <Select
                          value={editingField.type}
                          onValueChange={(type) => updateField(editingField.id, { type: type as any })}
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
                    </div>

                    <div>
                      <Label>Alan Anahtarı</Label>
                      <Input
                        value={editingField.key}
                        onChange={(e) => updateField(editingField.id, { key: e.target.value })}
                        placeholder="field_name"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Zorunlu Alan</Label>
                      <Switch
                        checked={editingField.required}
                        onCheckedChange={(required) => updateField(editingField.id, { required })}
                      />
                    </div>

                    {editingField.type === 'select' && (
                      <div>
                        <Label>Seçenekler (her satıra bir tane)</Label>
                        <Textarea
                          value={(editingField.options || []).join('\n')}
                          onChange={(e) => updateField(editingField.id, {
                            options: e.target.value.split('\n').filter(Boolean)
                          })}
                          placeholder="Seçenek 1&#10;Seçenek 2&#10;Seçenek 3"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Bu bölümde henüz alan yok</p>
                <p className="text-sm">Yukarıdaki "Alan Ekle" butonunu kullanın</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button onClick={() => onSave(editedSection)}>
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  );
};