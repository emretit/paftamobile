import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProposalTemplate } from "@/types/proposal-template";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const defaultTemplates: ProposalTemplate[] = [
  {
    id: "1",
    name: "Standart Teklif",
    description: "Genel kullanım için standart teklif şablonu",
    templateType: "standard",
    templateFeatures: ["Temel bilgiler", "Ürün listesi", "Ödeme koşulları"],
    items: [],
    prefilledFields: {
      title: "Teklif",
      validityDays: 30,
      paymentTerm: "net30"
    }
  },
  {
    id: "2", 
    name: "Hızlı Teklif",
    description: "Hızlı satış için basitleştirilmiş şablon",
    templateType: "quick",
    templateFeatures: ["Hızlı düzenleme", "Minimal bilgi"],
    items: [],
    prefilledFields: {
      title: "Hızlı Teklif",
      validityDays: 15,
      paymentTerm: "prepaid"
    }
  }
];

export const TemplateManagement = () => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<ProposalTemplate>>({
    name: "",
    description: "",
    templateType: "standard",
    templateFeatures: [],
    items: [],
    prefilledFields: {
      title: "",
      validityDays: 30,
      paymentTerm: "net30"
    }
  });

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.description) {
      toast.error("Şablon adı ve açıklama gereklidir");
      return;
    }

    const template: ProposalTemplate = {
      id: crypto.randomUUID(),
      name: newTemplate.name,
      description: newTemplate.description,
      templateType: newTemplate.templateType || "standard",
      templateFeatures: newTemplate.templateFeatures || [],
      items: newTemplate.items || [],
      prefilledFields: newTemplate.prefilledFields
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: "",
      description: "",
      templateType: "standard",
      templateFeatures: [],
      items: [],
      prefilledFields: {
        title: "",
        validityDays: 30,
        paymentTerm: "net30"
      }
    });
    setIsCreating(false);
    toast.success("Şablon başarıyla oluşturuldu");
  };

  const handleEditTemplate = (template: ProposalTemplate) => {
    setEditingTemplate(template);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    setTemplates(templates.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    ));
    setEditingTemplate(null);
    toast.success("Şablon başarıyla güncellendi");
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Şablon silindi");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Şablon Yönetimi</h2>
          <p className="text-muted-foreground">
            Teklif şablonlarınızı oluşturun ve düzenleyin
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)} 
          className="gap-2"
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          Yeni Şablon
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Şablon Oluştur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Şablon Adı</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  placeholder="Şablon adı girin"
                />
              </div>
              <div>
                <Label htmlFor="template-type">Şablon Tipi</Label>
                <Input
                  id="template-type"
                  value={newTemplate.templateType}
                  onChange={(e) => setNewTemplate({...newTemplate, templateType: e.target.value})}
                  placeholder="standard, quick, detailed..."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="template-description">Açıklama</Label>
              <Textarea
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="Şablon açıklaması"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                İptal
              </Button>
              <Button onClick={handleSaveTemplate} className="gap-2">
                <Save className="h-4 w-4" />
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {editingTemplate?.id === template.id ? (
                      <Input
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          name: e.target.value
                        })}
                        className="text-lg font-semibold"
                      />
                    ) : (
                      template.name
                    )}
                    <Badge variant="secondary">{template.templateType}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {editingTemplate?.id === template.id ? (
                      <Textarea
                        value={editingTemplate.description}
                        onChange={(e) => setEditingTemplate({
                          ...editingTemplate,
                          description: e.target.value
                        })}
                        className="mt-2"
                      />
                    ) : (
                      template.description
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {editingTemplate?.id === template.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleUpdateTemplate}
                        className="gap-1"
                      >
                        <Save className="h-3 w-3" />
                        Kaydet
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTemplate(null)}
                        className="gap-1"
                      >
                        <X className="h-3 w-3" />
                        İptal
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTemplate(template)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Sil
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {template.templateFeatures.map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};