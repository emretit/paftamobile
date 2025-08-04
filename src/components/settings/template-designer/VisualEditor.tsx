import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TemplateDesignSettings, TemplateSection, TemplateField } from "@/types/proposal-template";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GripVertical, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff, 
  Trash2,
  Type,
  Calendar,
  Hash,
  ToggleLeft
} from "lucide-react";
import { SectionEditor } from "./SectionEditor";

interface VisualEditorProps {
  designSettings: TemplateDesignSettings;
  onSettingsChange: (settings: TemplateDesignSettings) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  designSettings,
  onSettingsChange,
}) => {
  const [editingSection, setEditingSection] = useState<TemplateSection | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sections = Array.from(designSettings.sections);
    const [reorderedSection] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, reorderedSection);

    // Update order property
    const updatedSections = sections.map((section, index) => ({
      ...section,
      order: index,
    }));

    onSettingsChange({
      ...designSettings,
      sections: updatedSections,
    });
  };

  const toggleSectionEnabled = (sectionId: string) => {
    const updatedSections = designSettings.sections.map(section =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );

    onSettingsChange({
      ...designSettings,
      sections: updatedSections,
    });
  };

  const addNewSection = () => {
    const newSection: TemplateSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: 'Yeni Bölüm',
      enabled: true,
      order: designSettings.sections.length,
      settings: {},
    };

    onSettingsChange({
      ...designSettings,
      sections: [...designSettings.sections, newSection],
    });
  };

  const deleteSection = (sectionId: string) => {
    const updatedSections = designSettings.sections
      .filter(section => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index }));

    onSettingsChange({
      ...designSettings,
      sections: updatedSections,
    });
  };

  const updateSection = (updatedSection: TemplateSection) => {
    const updatedSections = designSettings.sections.map(section =>
      section.id === updatedSection.id ? updatedSection : section
    );

    onSettingsChange({
      ...designSettings,
      sections: updatedSections,
    });
    // setEditingSection(null); // Bu satırı kaldırdık - toggle değişikliklerinde sayfadan çıkmaması için
  };

  const getSectionIcon = (type: TemplateSection['type']) => {
    switch (type) {
      case 'header': return <Type className="w-4 h-4" />;
      case 'customer-info': return <Hash className="w-4 h-4" />;
      case 'proposal-info': return <Calendar className="w-4 h-4" />;
      case 'items-table': return <ToggleLeft className="w-4 h-4" />;
      case 'totals': return <Hash className="w-4 h-4" />;
      case 'terms': return <Type className="w-4 h-4" />;
      case 'footer': return <Type className="w-4 h-4" />;
      case 'custom': return <Plus className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  if (editingSection) {
    return (
      <SectionEditor
        section={editingSection}
        onSave={(updatedSection) => {
          updateSection(updatedSection);
          setEditingSection(null); // Sadece "Tamamla" butonuna basıldığında sayfadan çık
        }}
        onCancel={() => setEditingSection(null)}
        onAutoSave={updateSection} // Toggle değişiklikleri otomatik kaydet ama sayfadan çıkma
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Görsel Tasarlayıcı</h3>
          <p className="text-sm text-muted-foreground">
            Bölümleri sürükleyerek yeniden düzenleyin
          </p>
        </div>
        <Button onClick={addNewSection} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Bölüm Ekle
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {designSettings.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          transition-all duration-200
                          ${snapshot.isDragging ? 'shadow-lg rotate-1' : 'shadow-sm'}
                          ${!section.enabled ? 'opacity-50' : ''}
                        `}
                      >
                        <CardHeader className="py-3">
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                            </div>
                            
                            <div className="flex items-center gap-2 flex-1">
                              {getSectionIcon(section.type)}
                              <span className="font-medium">{section.title}</span>
                              <Badge variant={section.type === 'custom' ? 'default' : 'secondary'}>
                                {section.type}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={section.enabled}
                                onCheckedChange={() => toggleSectionEnabled(section.id)}
                              />
                              {section.enabled ? (
                                <Eye className="w-4 h-4 text-green-600" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSection(section)}
                                className="h-8 w-8 p-0"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>

                              {section.type === 'custom' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSection(section.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Branding Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marka Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Şirket Adı</label>
            <Input
              value={designSettings.branding.companyName}
              onChange={(e) => onSettingsChange({
                ...designSettings,
                branding: {
                  ...designSettings.branding,
                  companyName: e.target.value,
                },
              })}
              placeholder="Şirket adınızı girin"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Slogan (Opsiyonel)</label>
            <Input
              value={designSettings.branding.tagline || ''}
              onChange={(e) => onSettingsChange({
                ...designSettings,
                branding: {
                  ...designSettings.branding,
                  tagline: e.target.value,
                },
              })}
              placeholder="Şirket sloganınızı girin"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Website (Opsiyonel)</label>
            <Input
              value={designSettings.branding.website || ''}
              onChange={(e) => onSettingsChange({
                ...designSettings,
                branding: {
                  ...designSettings.branding,
                  website: e.target.value,
                },
              })}
              placeholder="www.sirketiniz.com"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};