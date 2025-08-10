import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PDFMeTemplate {
  id: string;
  name: string;
  template_json: any;
  created_at: string;
  updated_at: string;
}

export const usePDFMeTemplates = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Supabase'den PDFMe şablonlarını çek
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['pdfme-templates'],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return [];

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', userRes.user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching PDFMe templates:', error);
        return [];
      }

      return data || [];
    }
  });

  // Set default template on mount
  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [selectedTemplateId, templates.length]);

  const getSelectedTemplate = () => {
    return templates.find(t => t.id === selectedTemplateId) || (templates.length > 0 ? templates[0] : null);
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const getTemplateById = (templateId: string) => {
    return templates.find(t => t.id === templateId) || null;
  };

  return {
    templates,
    selectedTemplateId,
    selectedTemplate: getSelectedTemplate(),
    selectTemplate,
    getTemplateById,
    setSelectedTemplateId,
    isLoading
  };
};
