import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PdfTemplateComponent } from '@/utils/pdfTemplateRegistry';
import { ProposalTemplate } from '@/types/proposal-template';

// Supabase şablonunu PdfTemplateComponent formatına çevir
const convertDbTemplateToPdfTemplate = (dbTemplate: any): PdfTemplateComponent => {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    description: dbTemplate.description || '',
    category: dbTemplate.template_type || 'custom',
    component: null, // Dinamik template için component yok
    features: dbTemplate.template_features || [],
    previewImage: dbTemplate.preview_image,
    designSettings: dbTemplate.design_settings,
    isDynamic: true // Dinamik template olduğunu belirt
  };
};

export const usePdfTemplates = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Supabase'den dinamik şablonları çek
  const { data: dynamicTemplates, isLoading } = useQuery({
    queryKey: ['pdf-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      return data?.map(convertDbTemplateToPdfTemplate) || [];
    }
  });

  // Sadece Supabase'den gelen dinamik template'leri kullan
  const allTemplates = dynamicTemplates || [];

  // Set default template on mount (prefer active)
  useEffect(() => {
    const pickDefault = async () => {
      if (!selectedTemplateId && allTemplates.length > 0) {
        try {
          const { data } = await supabase
            .from('proposal_templates')
            .select('id')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();
          if (data?.id) {
            setSelectedTemplateId(data.id);
          } else {
            setSelectedTemplateId(allTemplates[0].id);
          }
        } catch (err) {
          setSelectedTemplateId(allTemplates[0].id);
        }
      }
    };
    pickDefault();
  }, [selectedTemplateId, allTemplates.length]);

  const getSelectedTemplate = () => {
    return allTemplates.find(t => t.id === selectedTemplateId) || (allTemplates.length > 0 ? allTemplates[0] : null);
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const getTemplateById = (templateId: string) => {
    return allTemplates.find(t => t.id === templateId) || null;
  };

  return {
    templates: allTemplates,
    selectedTemplateId,
    selectedTemplate: getSelectedTemplate(),
    selectTemplate,
    getTemplateById,
    setSelectedTemplateId,
    isLoading
  };
};