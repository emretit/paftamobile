import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProposalTemplate } from "@/types/proposal-template";
import { Plus, Edit, Trash2, Save, X, Palette, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TemplateDesigner } from "./template-designer/TemplateDesigner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

// type ProposalTemplateDB = Database['public']['Tables']['proposal_templates']['Row'];
// type ProposalTemplateInsert = Database['public']['Tables']['proposal_templates']['Insert'];
// type ProposalTemplateUpdate = Database['public']['Tables']['proposal_templates']['Update'];

export const TemplateManagement: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<ProposalTemplate | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch templates from Supabase
  const { data: templates, isLoading } = useQuery({
    queryKey: ['proposal-templates'],
    queryFn: async (): Promise<ProposalTemplate[]> => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        toast.error('Şablonlar yüklenirken hata oluştu');
        return [];
      }

      return data?.map(dbTemplate => ({
        id: dbTemplate.id,
        name: dbTemplate.name,
        description: dbTemplate.description || '',
        templateType: dbTemplate.template_type,
        templateFeatures: dbTemplate.template_features || [],
        items: dbTemplate.items || [],
        designSettings: dbTemplate.design_settings,
        prefilledFields: dbTemplate.prefilled_fields || {},
        popularity: dbTemplate.popularity,
        estimatedTime: dbTemplate.estimated_time,
        usageCount: dbTemplate.usage_count,
        isRecommended: dbTemplate.is_recommended,
        tags: dbTemplate.tags || [],
        previewImage: dbTemplate.preview_image
      })) || [];
    }
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (template: any) => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
      toast.success('Şablon başarıyla oluşturuldu');
      setIsCreating(false);
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Şablon oluşturulurken hata oluştu');
    }
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...template }: any) => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
      toast.success('Şablon başarıyla güncellendi');
      setEditingTemplate(null);
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Şablon güncellenirken hata oluştu');
    }
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Attempting to delete template:', id);
      
      const { data, error } = await supabase
        .from('proposal_templates')
        .delete()
        .eq('id', id)
        .select();

      console.log('Delete response:', { data, error });
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Delete success:', data);
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
      toast.success('Şablon başarıyla silindi');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error(`Şablon silinirken hata oluştu: ${error.message}`);
    }
  });

  const handleCreateTemplate = async (templateData: Partial<ProposalTemplate>) => {
    const newTemplate: any = {
      name: templateData.name || 'Yeni Şablon',
      description: templateData.description || '',
      template_type: templateData.templateType || 'standard',
      template_features: templateData.templateFeatures || [],
      items: templateData.items || [],
      design_settings: templateData.designSettings || null,
      prefilled_fields: templateData.prefilledFields || {},
      popularity: templateData.popularity || 4.8,
      estimated_time: templateData.estimatedTime || '5 dk',
      usage_count: templateData.usageCount || '0',
      is_recommended: templateData.isRecommended || false,
      tags: templateData.tags || [],
      preview_image: templateData.previewImage || null
    };

    createMutation.mutate(newTemplate);
  };

  const handleUpdateTemplate = async (templateData: Partial<ProposalTemplate>) => {
    if (!editingTemplate) return;

    const updateData: any = {
      name: templateData.name,
      description: templateData.description,
      template_type: templateData.templateType,
      template_features: templateData.templateFeatures,
      items: templateData.items,
      design_settings: templateData.designSettings,
      prefilled_fields: templateData.prefilledFields,
      popularity: templateData.popularity,
      estimated_time: templateData.estimatedTime,
      usage_count: templateData.usageCount,
      is_recommended: templateData.isRecommended,
      tags: templateData.tags,
      preview_image: templateData.previewImage
    };

    updateMutation.mutate({ id: editingTemplate.id, ...updateData });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Bu şablonu silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteTemplateWithError = (id: string) => {
    if (confirm('Bu şablonu silmek istediğinizden emin misiniz?')) {
      console.log('Starting delete process for template:', id);
      deleteMutation.mutate(id);
    }
  };

  const handleDesignSettings = (template: ProposalTemplate) => {
    setCurrentTemplate(template);
    setIsDesigning(true);
  };

  const handleDesignSave = async (designSettings: any) => {
    if (!currentTemplate) return;

    const updateData: any = {
      design_settings: designSettings
    };

    updateMutation.mutate({ id: currentTemplate.id, ...updateData });
    setIsDesigning(false);
    setCurrentTemplate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Şablonlar yükleniyor...</span>
      </div>
    );
  }

  if (isDesigning && currentTemplate) {
    return (
      <TemplateDesigner
        template={currentTemplate}
        onSave={handleDesignSave}
        onCancel={() => {
          setIsDesigning(false);
          setCurrentTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Teklif Şablonları</h2>
          <p className="text-gray-600">Şablonlarınızı yönetin ve düzenleyin</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Şablon
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni Şablon Oluştur</CardTitle>
            <CardDescription>
              Yeni bir teklif şablonu oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Şablon Adı</Label>
                <Input
                  id="name"
                  placeholder="Standart Teklif"
                  onChange={(e) => {
                    // Handle name change
                  }}
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Şablon açıklaması..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    handleCreateTemplate({
                      name: 'Yeni Şablon',
                      description: 'Yeni oluşturulan şablon',
                      templateType: 'standard',
                      templateFeatures: ['Temel özellikler']
                    });
                  }}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Oluştur
                </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)}
              >
                  <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {templates?.map((template) => (
          <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{template.name}</h3>
                  {template.isRecommended && (
                    <Badge variant="secondary" className="text-xs">Önerilen</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {template.description}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Tip: {template.templateType}</span>
                  {template.popularity && (
                    <span>Popülerlik: {template.popularity}/5</span>
                  )}
                  {template.usageCount && (
                    <span>Kullanım: {template.usageCount}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDesignSettings(template)}
                className="h-8 w-8 p-0"
              >
                <Palette className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingTemplate(template)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteTemplateWithError(template.id)}
                disabled={deleteMutation.isPending}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editingTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Şablon Düzenle</CardTitle>
            <CardDescription>
              {editingTemplate.name} şablonunu düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Şablon Adı</Label>
                <Input
                  id="edit-name"
                  defaultValue={editingTemplate.name}
                  onChange={(e) => {
                    setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Açıklama</Label>
                <Textarea
                  id="edit-description"
                  defaultValue={editingTemplate.description}
                  rows={3}
                  onChange={(e) => {
                    setEditingTemplate({
                      ...editingTemplate,
                      description: e.target.value
                    });
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateTemplate(editingTemplate)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Kaydet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingTemplate(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};