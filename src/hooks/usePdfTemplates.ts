import { useState, useEffect } from 'react';
import { pdfTemplateRegistry, PdfTemplateComponent, getDefaultTemplate } from '@/utils/pdfTemplateRegistry';

export const usePdfTemplates = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templates] = useState<PdfTemplateComponent[]>(pdfTemplateRegistry);

  // Set default template on mount
  useEffect(() => {
    const defaultTemplate = getDefaultTemplate();
    setSelectedTemplateId(defaultTemplate.id);
  }, []);

  const getSelectedTemplate = () => {
    return templates.find(t => t.id === selectedTemplateId) || getDefaultTemplate();
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
    setSelectedTemplateId
  };
};