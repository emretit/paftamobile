/**
 * Offer PDF Designer Component
 * 
 * Integrates pdfme Designer for creating PDF templates in the browser
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateService } from '../../services/pdf/templateService';
import { importPdfme, validateTemplate, createBlankTemplate } from '../../lib/pdf/pdfmeUtils';
import type { PdfTemplate } from '../../lib/pdf/types';

interface OfferPdfDesignerProps {
  templateId?: string;
  onSave?: (template: PdfTemplate) => void;
  onTemplateChange?: (template: any) => void;
}

export const OfferPdfDesigner: React.FC<OfferPdfDesignerProps> = ({
  templateId,
  onSave,
  onTemplateChange,
}) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [designerInstance, setDesignerInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState<PdfTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [availableFonts, setAvailableFonts] = useState<Array<{ name: string; url: string }>>([]);

  // Load template if editing existing one
  useEffect(() => {
    if (templateId) {
      loadTemplate();
    } else {
      setTemplateName('New PDF Template');
      setTemplateDescription('');
    }
  }, [templateId]);

  // Initialize designer when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeDesigner();
    }

    return () => {
      if (designerInstance) {
        try {
          designerInstance.destroy();
        } catch (error) {
          console.warn('Error destroying designer:', error);
        }
      }
    };
  }, [template]);

  // Load available fonts
  useEffect(() => {
    loadAvailableFonts();
  }, []);

  const loadTemplate = async () => {
    if (!templateId) return;

    try {
      const loadedTemplate = await TemplateService.getTemplate(templateId);
      if (loadedTemplate) {
        setTemplate(loadedTemplate);
        setTemplateName(loadedTemplate.name);
        setTemplateDescription(loadedTemplate.description || '');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Failed to load template');
    }
  };

  const loadAvailableFonts = async () => {
    try {
      const fonts = await TemplateService.getAvailableFonts();
      setAvailableFonts(fonts);
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  };

  const initializeDesigner = async () => {
    if (!designerRef.current) return;

    try {
      setIsLoading(true);

      // Import pdfme modules (client-side only)
      const { Designer, plugins, BLANK_PDF } = await importPdfme();

      // Prepare template
      let pdfmeTemplate;
      if (template?.template_json) {
        pdfmeTemplate = JSON.parse(JSON.stringify(template.template_json));
      } else {
        pdfmeTemplate = createBlankTemplate();
      }

      // Handle BLANK_PDF placeholder
      if (pdfmeTemplate.basePdf === 'BLANK_PDF') {
        pdfmeTemplate.basePdf = BLANK_PDF;
      }

      // Validate template
      const validation = validateTemplate(pdfmeTemplate);
      if (!validation.valid) {
        console.warn('Template validation warnings:', validation.errors);
      }

      // Clear container
      designerRef.current.innerHTML = '';

      // Prepare fonts
      const fonts = availableFonts.reduce((acc, font) => {
        const fontName = font.name.replace(/\.[^/.]+$/, ''); // Remove extension
        acc[fontName] = {
          data: font.url,
          fallback: 'sans-serif',
        };
        return acc;
      }, {} as Record<string, any>);

      // Create designer instance
      const designer = new Designer({
        domContainer: designerRef.current,
        template: pdfmeTemplate,
        plugins,
        options: {
          font: fonts,
          lang: 'en',
          labels: {
            'clear': '🗑️',
            'cancel': 'Cancel',
            'field': 'Field',
            'fieldsList': 'Fields',
            'edit': 'Edit',
            'plsInputName': 'Please input field name',
            'fieldMustUniq': 'Field name must be unique',
            'notUniqName': 'Name is not unique',
            'plsSelectField': 'Please select a field',
          },
        },
      });

      setDesignerInstance(designer);
      setIsLoading(false);
      toast.success('PDF Designer loaded successfully');

    } catch (error: any) {
      console.error('Error initializing designer:', error);
      toast.error(`Failed to load PDF Designer: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!designerInstance) {
      toast.error('Designer not ready');
      return;
    }

    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      setIsSaving(true);
      const currentTemplate = designerInstance.getTemplate();

      // Validate template before saving
      const validation = validateTemplate(currentTemplate);
      if (!validation.valid) {
        toast.error(`Template validation failed: ${validation.errors[0]}`);
        return;
      }

      let savedTemplate: PdfTemplate;

      if (templateId && template) {
        // Update existing template
        savedTemplate = await TemplateService.updateTemplate(templateId, {
          name: templateName,
          description: templateDescription,
          template_json: currentTemplate,
        });
      } else {
        // Create new template
        savedTemplate = await TemplateService.createTemplate(
          templateName,
          templateDescription,
          currentTemplate
        );
      }

      setTemplate(savedTemplate);
      toast.success('Template saved successfully');
      onSave?.(savedTemplate);
      onTemplateChange?.(currentTemplate);

    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(`Failed to save template: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = useCallback(async () => {
    if (!designerInstance) {
      toast.error('Designer not ready');
      return;
    }

    try {
      const currentTemplate = designerInstance.getTemplate();
      const { generate, plugins } = await importPdfme();

      // Generate sample data for preview
      const sampleData: Record<string, any> = {};
      if (currentTemplate.schemas?.[0]) {
        Object.keys(currentTemplate.schemas[0]).forEach(fieldName => {
          const field = currentTemplate.schemas[0][fieldName];
          if (field.type === 'text') {
            sampleData[fieldName] = `Sample ${fieldName}`;
          } else if (field.type === 'image') {
            sampleData[fieldName] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
          } else {
            sampleData[fieldName] = `Sample ${fieldName}`;
          }
        });
      }

      const pdf = await generate({
        template: currentTemplate,
        inputs: [sampleData],
        plugins,
      });

      // Open PDF in new tab
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success('Preview generated successfully');
    } catch (error: any) {
      console.error('Error generating preview:', error);
      toast.error(`Failed to generate preview: ${error.message}`);
    }
  }, [designerInstance]);

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await TemplateService.uploadFont(file);
      setAvailableFonts(prev => [...prev, { name: file.name, url }]);
      toast.success('Font uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading font:', error);
      toast.error(`Failed to upload font: ${error.message}`);
    }
  };

  const handleBasePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !designerInstance) return;

    try {
      const url = await TemplateService.uploadBasePdf(file);
      
      // Load the PDF and update the designer
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      const currentTemplate = designerInstance.getTemplate();
      currentTemplate.basePdf = arrayBuffer;
      
      designerInstance.updateTemplate(currentTemplate);
      toast.success('Base PDF uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading base PDF:', error);
      toast.error(`Failed to upload base PDF: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Files</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="fontUpload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Font
                    <input
                      id="fontUpload"
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2"
                      onChange={handleFontUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="pdfUpload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Base PDF
                    <input
                      id="pdfUpload"
                      type="file"
                      accept=".pdf"
                      onChange={handleBasePdfUpload}
                      className="hidden"
                    />
                  </label>
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="templateDescription">Description</Label>
            <Textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Enter template description..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading || !designerInstance}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Designer Container */}
      <Card>
        <CardHeader>
          <CardTitle>PDF Template Designer</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading PDF Designer...</p>
              </div>
            </div>
          ) : (
            <div
              ref={designerRef}
              className="pdfme-designer-container w-full border rounded"
              style={{
                minHeight: '600px',
                height: '70vh',
                backgroundColor: '#f8f9fa',
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};