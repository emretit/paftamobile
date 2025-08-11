/**
 * PDF Template Manager Page
 * 
 * Combined interface for template design and field mapping
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  FileText, 
  MapPin, 
  Download, 
  Eye 
} from 'lucide-react';

import { OfferPdfDesigner } from '@/components/pdf/OfferPdfDesigner';
import { MappingPanel } from '@/components/pdf/MappingPanel';
import { TemplateService } from '@/services/pdf/templateService';
import { ExportService } from '@/services/pdf/exportService';
import type { PdfTemplate, FieldMapping } from '@/lib/pdf/types';

export const PdfTemplateManager: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<PdfTemplate | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('design');

  const isEditMode = Boolean(id && id !== 'new');

  useEffect(() => {
    if (isEditMode) {
      loadTemplate();
    }
  }, [id, isEditMode]);

  const loadTemplate = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const loadedTemplate = await TemplateService.getTemplate(id);
      
      if (loadedTemplate) {
        setTemplate(loadedTemplate);
        setCurrentTemplate(loadedTemplate.template_json);
        setMapping(loadedTemplate.field_mapping_json || {});
      }
    } catch (error: any) {
      console.error('Error loading template:', error);
      toast.error(`Failed to load template: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (newTemplate: any) => {
    setCurrentTemplate(newTemplate);
  };

  const handleTemplateSave = (savedTemplate: PdfTemplate) => {
    setTemplate(savedTemplate);
    if (!isEditMode) {
      navigate(`/pdf-templates/${savedTemplate.id}`);
    }
  };

  const handleMappingChange = (newMapping: FieldMapping) => {
    setMapping(newMapping);
  };

  const handleMappingSave = async (newMapping: FieldMapping) => {
    if (!template) {
      toast.error('Please save the template first');
      return;
    }

    try {
      setIsLoading(true);
      const updatedTemplate = await TemplateService.updateFieldMapping(
        template.id,
        newMapping
      );
      setTemplate(updatedTemplate);
      setMapping(newMapping);
    } catch (error: any) {
      console.error('Error saving mapping:', error);
      toast.error(`Failed to save mapping: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!currentTemplate) {
      toast.error('Please create a template first');
      return;
    }

    try {
      await ExportService.previewPdf(currentTemplate, mapping);
      toast.success('Preview generated successfully');
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error(error.message);
    }
  };

  const handleExport = async () => {
    if (!template) {
      toast.error('Please save the template first');
      return;
    }

    // For demo purposes, use a sample offer ID
    const sampleOfferId = 'sample-offer-001';

    try {
      await ExportService.exportPdf(template.id, sampleOfferId, 'offer');
      toast.success('PDF exported successfully');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pdf-templates')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">
              {isEditMode ? 'Edit PDF Template' : 'Create PDF Template'}
            </h1>
            <p className="text-muted-foreground">
              Design templates and map fields for PDF generation
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!currentTemplate}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleExport}
            disabled={!template}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Sample
          </Button>
        </div>
      </div>

      {/* Template Status */}
      {template && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description || 'No description'}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date(template.updated_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="design" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Template Design
          </TabsTrigger>
          <TabsTrigger value="mapping" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Field Mapping
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="space-y-6">
          <OfferPdfDesigner
            templateId={isEditMode ? id : undefined}
            onSave={handleTemplateSave}
            onTemplateChange={handleTemplateChange}
          />
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          {currentTemplate ? (
            <MappingPanel
              template={currentTemplate}
              initialMapping={mapping}
              onChange={handleMappingChange}
              onSave={handleMappingSave}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Template Available</h3>
                <p className="text-muted-foreground mb-4">
                  Please create a template in the Design tab first.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('design')}
                >
                  Go to Template Design
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PdfTemplateManager;