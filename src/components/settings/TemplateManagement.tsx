import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProposalTemplate } from "@/types/proposal-template";
import { Plus, Edit, Trash2, Save, X, Palette, Loader2, Eye, Copy, Download, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TemplateDesigner } from "./template-designer/TemplateDesigner";
import { TemplateGallery } from "./template-designer/TemplateGallery";
import { TemplatePreviewPanel } from "./template-designer/TemplatePreviewPanel";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

// type ProposalTemplateDB = Database['public']['Tables']['proposal_templates']['Row'];
// type ProposalTemplateInsert = Database['public']['Tables']['proposal_templates']['Insert'];
// type ProposalTemplateUpdate = Database['public']['Tables']['proposal_templates']['Update'];

export const TemplateManagement: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDesigning, setIsDesigning] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
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
    if (!currentTemplate) return;

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

    updateMutation.mutate({ id: currentTemplate.id, ...updateData });
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

  const handleDuplicateTemplate = async (template: ProposalTemplate) => {
    const duplicatedTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Kopya)`,
      description: `${template.description} - Kopyalandı`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await handleCreateTemplate(duplicatedTemplate);
      toast.success('Şablon kopyalandı');
    } catch (error) {
      toast.error('Şablon kopyalanırken bir hata oluştu');
    }
  };

  const handleDesignSave = async (template: ProposalTemplate) => {
    handleUpdateTemplate(template);
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

  if (isDesigning) {
    return (
      <TemplateDesigner
        template={currentTemplate || undefined}
        onSave={currentTemplate ? handleDesignSave : handleCreateTemplate}
        onCancel={() => {
          setIsDesigning(false);
          setCurrentTemplate(null);
        }}
      />
    );
  }

  if (isPreviewMode && currentTemplate) {
    return (
      <TemplatePreviewPanel
        template={currentTemplate}
        onToggleFullscreen={() => {}}
        onDownloadPDF={() => toast.info('PDF indirme özelliği yakında eklenecek')}
        onPrint={() => toast.info('Yazdırma özelliği yakında eklenecek')}
        onShare={() => toast.info('Paylaşma özelliği yakında eklenecek')}
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

      <TemplateGallery
        templates={templates || []}
        onCreateNew={() => {
          setCurrentTemplate(null);
          setIsDesigning(true);
        }}
        onEdit={(template) => {
          setCurrentTemplate(template);
          setIsDesigning(true);
        }}
        onPreview={(template) => {
          setCurrentTemplate(template);
          setIsPreviewMode(true);
        }}
        onDuplicate={handleDuplicateTemplate}
        onDelete={(template) => handleDeleteTemplateWithError(template.id)}
        onImport={() => {
          toast.info('İçe aktarma özelliği yakında eklenecek');
        }}
        onExport={(template) => {
          toast.info('Dışa aktarma özelliği yakında eklenecek');
        }}
        onUseTemplate={(template) => {
          toast.success(`"${template.name}" şablonu kullanıma hazır`);
          // Burada kullanıcıyı teklif oluşturma sayfasına yönlendirebilirsiniz
        }}
      />
    </div>
  );
};