import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { OfferPdfDesigner } from '@/components/pdf/OfferPdfDesigner';
import { MappingPanel } from '@/components/pdf/MappingPanel';
import { TemplateService } from '@/services/pdf/templateService';
import { ExportService } from '@/services/pdf/exportService';
import { useActiveProject } from '@/hooks/useActiveProject';
import type { PdfTemplate, FieldMapping } from '@/lib/pdf/types';

const PdfTemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeProject, hasWriteAccess } = useActiveProject();
  const designerRef = useRef<any>(null);
  
  const [template, setTemplate] = useState<PdfTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateJson, setTemplateJson] = useState<any>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      loadTemplate(id);
    }
  }, [id, isEditMode]);

  const loadTemplate = async (templateId: string) => {
    try {
      setIsLoading(true);
      const data = await TemplateService.getTemplate(templateId);
      if (data) {
        setTemplate(data);
        setTemplateName(data.name);
        setTemplateDescription(data.description || '');
        setTemplateJson(data.template_json);
        setFieldMapping(data.field_mapping_json || {});
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Şablon yüklenemedi');
      navigate('/templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!hasWriteAccess) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    if (!activeProject) {
      toast.error('Aktif proje bulunamadı');
      return;
    }

    if (!templateName.trim()) {
      toast.error('Şablon adı gerekli');
      return;
    }

    if (!templateJson) {
      toast.error('Şablon tasarımı gerekli');
      return;
    }

    try {
      setIsSaving(true);
      
      const templateData = {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        template_json: templateJson,
        field_mapping_json: fieldMapping,
        project_id: activeProject.id,
      };

      if (isEditMode && id) {
        await TemplateService.updateTemplate(id, templateData);
        toast.success('Şablon güncellendi');
      } else {
        const newTemplate = await TemplateService.createTemplate(templateData as any);
        toast.success('Şablon oluşturuldu');
        navigate(`/templates/${newTemplate.id}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Şablon kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!templateJson) {
      toast.error('Önce şablon tasarımını tamamlayın');
      return;
    }

    try {
      setIsPreviewing(true);
      toast.info('PDF önizlemesi oluşturuluyor...');
      await ExportService.previewPdf(templateJson, fieldMapping);
    } catch (error) {
      console.error('Error previewing template:', error);
      toast.error('Önizleme oluşturulamadı');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleTemplateChange = (newTemplate: any) => {
    setTemplateJson(newTemplate);
  };

  const handleMappingChange = (newMapping: FieldMapping) => {
    setFieldMapping(newMapping);
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Proje Seçilmedi</h2>
          <p className="text-muted-foreground">Şablon düzenlemek için bir proje seçin.</p>
          <Button onClick={() => navigate('/templates')} className="mt-4">
            Şablonlara Dön
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Şablon yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/templates')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Geri
          </Button>
          
          <div className="flex-1">
            <h1 className="font-semibold">
              {isEditMode ? 'Şablon Düzenle' : 'Yeni Şablon'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              disabled={isPreviewing || !templateJson}
            >
              {isPreviewing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Eye className="h-4 w-4 mr-1" />
              )}
              Önizle
            </Button>
            
            {hasWriteAccess && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !templateName.trim() || !templateJson}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Kaydet
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Template Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Şablon Bilgileri</CardTitle>
                <CardDescription>
                  Şablon adı ve açıklamasını girin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Şablon Adı</Label>
                  <Input
                    id="name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Örn: Teklif Şablonu"
                    disabled={!hasWriteAccess}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Şablon açıklaması (opsiyonel)"
                    rows={3}
                    disabled={!hasWriteAccess}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Field Mapping */}
            <Card>
              <CardHeader>
                <CardTitle>Alan Eşleştirme</CardTitle>
                <CardDescription>
                  Şablon alanlarını veritabanı sütunlarıyla eşleştirin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MappingPanel
                  template={templateJson}
                  mapping={fieldMapping}
                  onChange={handleMappingChange}
                  disabled={!hasWriteAccess}
                />
              </CardContent>
            </Card>
          </div>

          {/* Designer */}
          <div className="lg:col-span-3">
            {!hasWriteAccess && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Bu şablonu düzenleme yetkiniz yok. Sadece görüntüleme modundasınız.
                </AlertDescription>
              </Alert>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>PDF Tasarımcı</CardTitle>
                <CardDescription>
                  Sürükle-bırak ile PDF şablonunuzu tasarlayın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OfferPdfDesigner
                  ref={designerRef}
                  initialTemplate={templateJson}
                  onTemplateChange={handleTemplateChange}
                  disabled={!hasWriteAccess}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfTemplateEditor;