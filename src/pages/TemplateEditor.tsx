/**
 * Template Editor Page
 * 
 * PDF template editor using pdfme UI component.
 * Handles template creation, editing, and PDF preview generation.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, FileDown } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';
import { useActiveProject } from '@/hooks/useActiveProject';
import { createDefaultQuoteTemplate } from '@/pdf/defaultQuoteTemplate';
import { generateQuotePdf, openPdfInNewTab } from '@/pdf/generateQuotePdf';
import { mapQuotationToInputs, createMockQuotation } from '@/pdf/mapQuotationToInputs';

export const TemplateEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeProject, hasWriteAccess } = useActiveProject();
  const { templates, createTemplate, updateTemplate } = useTemplates();
  
  const designerRef = useRef<HTMLDivElement>(null);
  const [designerInstance, setDesignerInstance] = useState<any>(null);
  const [templateName, setTemplateName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isEditMode = Boolean(id && id !== 'new');
  const currentTemplate = isEditMode ? templates.find(t => t.id === id) : null;

  useEffect(() => {
    if (isEditMode && currentTemplate) {
      setTemplateName(currentTemplate.name);
    } else {
      setTemplateName('New Template');
    }
  }, [isEditMode, currentTemplate]);

  useEffect(() => {
    initializeDesigner();
    
    // Cleanup on unmount
    return () => {
      if (designerInstance) {
        try {
          designerInstance.destroy?.();
        } catch (error) {
          console.warn('Designer cleanup error:', error);
        }
      }
    };
  }, [currentTemplate]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [designerInstance, templateName]);

  const initializeDesigner = async () => {
    if (!designerRef.current) return;

    try {
      setIsLoading(true);
      
      const [{ Designer }, { text, image, table }, { BLANK_PDF }] = await Promise.all([
        import('@pdfme/ui'),
        import('@pdfme/schemas'),
        import('@pdfme/common')
      ]);

      // Prepare template
      let template;
      if (isEditMode && currentTemplate) {
        template = JSON.parse(JSON.stringify(currentTemplate.template_json));
      } else {
        template = createDefaultQuoteTemplate();
      }

      // Handle BLANK_PDF placeholder
      if (template.basePdf === 'BLANK_PDF') {
        template.basePdf = BLANK_PDF;
      }

      // Clear container
      if (designerRef.current) {
        designerRef.current.innerHTML = '';
      }

      // Create designer instance
      const designer = new Designer({
        domContainer: designerRef.current,
        template,
        plugins: {
          text,
          image,
          table,
        } as any,
        options: {
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
      toast.success('Template editor loaded successfully');

    } catch (error: any) {
      console.error('Designer initialization error:', error);
      toast.error(`Failed to load editor: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!designerInstance || !hasWriteAccess) {
      if (!hasWriteAccess) {
        toast.error('You do not have permission to save templates');
      }
      return;
    }

    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      setIsSaving(true);
      const templateJson = designerInstance.getTemplate();

      if (isEditMode && currentTemplate) {
        await updateTemplate(currentTemplate.id, {
          name: templateName,
          template_json: templateJson,
        });
      } else {
        const newTemplate = await createTemplate(templateName, templateJson);
        if (newTemplate) {
          navigate(`/templates/${newTemplate.id}`);
        }
      }

      toast.success('Template saved successfully');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Failed to save template: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!designerInstance) {
      toast.error('Editor not ready');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      
      const template = designerInstance.getTemplate();
      const mockQuotation = createMockQuotation();
      const inputs = mapQuotationToInputs(mockQuotation, {
        name: 'Your Company Name',
        address: '123 Business St, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@yourcompany.com',
      });

      const pdf = await generateQuotePdf(template, inputs);
      openPdfInNewTab(pdf);
      
      toast.success('PDF preview opened in new tab');
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error(`Failed to generate preview: ${error.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleLoadStarter = () => {
    if (!designerInstance || !hasWriteAccess) return;

    if (window.confirm('This will replace the current template. Continue?')) {
      const starterTemplate = createDefaultQuoteTemplate();
      designerInstance.updateTemplate(starterTemplate);
      toast.success('Starter template loaded');
    }
  };

  if (!activeProject) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Active Project</h2>
            <p className="text-muted-foreground">
              Please select or create a project to edit templates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="text-muted-foreground">
              Design PDF templates for {activeProject.name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!designerInstance || isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              'Generating...'
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>

          {hasWriteAccess && (
            <Button
              onClick={handleSave}
              disabled={!designerInstance || isSaving}
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Template Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Template Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name..."
              disabled={!hasWriteAccess}
            />
          </div>

          {hasWriteAccess && !isEditMode && (
            <Button
              variant="outline"
              onClick={handleLoadStarter}
              disabled={!designerInstance}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Load Starter Template
            </Button>
          )}
        </CardContent>
      </Card>

      {/* PDF Designer */}
      <Card>
        <CardHeader>
          <CardTitle>Template Designer</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading template editor...</p>
              </div>
            </div>
          ) : (
            <div 
              ref={designerRef} 
              className="pdfme-designer-container w-full border rounded"
              style={{
                minHeight: '600px',
                height: '70vh',
              }}
            />
          )}

          {!hasWriteAccess && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                🔒 You have read-only access to this template.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Keyboard Shortcuts:</strong></p>
            <p>• Ctrl/Cmd + S: Save template</p>
            <p>• Use the toolbar to add text fields, images, and tables</p>
            <p>• Preview your template with sample quotation data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateEditor;