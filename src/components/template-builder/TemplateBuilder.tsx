import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Save, Download, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ElementPalette } from './ElementPalette';
import { TemplateBuilderProps, PredefinedElement, DroppedElement } from '@/types/template-builder';
import { supabase } from '@/integrations/supabase/client';
import { OfferPdfDesigner, OfferPdfDesignerHandle } from '@/components/pdf/OfferPdfDesigner';

export interface TemplateBuilderHandle {
  getTemplate: () => any;
}

export const TemplateBuilder = forwardRef<TemplateBuilderHandle, TemplateBuilderProps>(
  ({ initialTemplate, onTemplateChange, onSave }, ref) => {
    const [currentTemplate, setCurrentTemplate] = useState<any>(null);
    const [templateName, setTemplateName] = useState('Yeni Şablon');
    const [droppedElements, setDroppedElements] = useState<DroppedElement[]>([]);
    const [draggedElement, setDraggedElement] = useState<PredefinedElement | null>(null);
    const pdfDesignerRef = useRef<OfferPdfDesignerHandle>(null);

    useImperativeHandle(ref, () => ({
      getTemplate: () => {
        if (pdfDesignerRef.current) {
          return pdfDesignerRef.current.getTemplate();
        }
        return currentTemplate;
      }
    }));

    useEffect(() => {
      if (initialTemplate) {
        setCurrentTemplate(initialTemplate);
      }
    }, [initialTemplate]);

    const handleElementDragStart = (element: PredefinedElement) => {
      setDraggedElement(element);
    };

    const handleTemplateChange = (template: any) => {
      setCurrentTemplate(template);
      onTemplateChange?.(template);
    };

    const handlePreview = async () => {
      if (!pdfDesignerRef.current) {
        toast.error('PDF tasarımcısı hazır değil');
        return;
      }

      try {
        const template = pdfDesignerRef.current.getTemplate();
        
        // Dynamic import of generator
        const { generate } = await import('@pdfme/generator');
        const { text, image, table } = await import('@pdfme/schemas');

        // Create sample data
        const sampleData: Record<string, any> = {};
        if (template.schemas?.[0]) {
          Object.keys(template.schemas[0]).forEach(fieldName => {
            sampleData[fieldName] = `Örnek ${fieldName}`;
          });
        }

        const pdf = await generate({
          template,
          inputs: [sampleData],
          plugins: { text, image, table } as any,
        });

        // Open PDF in new tab
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast.success('Önizleme oluşturuldu');

      } catch (error: any) {
        console.error('Error generating preview:', error);
        toast.error(`Önizleme oluşturulamadı: ${error.message}`);
      }
    };

    const handleSave = async () => {
      if (!pdfDesignerRef.current) {
        toast.error('PDF tasarımcısı hazır değil');
        return;
      }

      try {
        const template = pdfDesignerRef.current.getTemplate();
        
        if (onSave) {
          onSave(template, templateName);
        } else {
          // Doğrudan veritabanına kaydet
          const { data: user } = await supabase.auth.getUser();
          if (!user.user) {
            toast.error('Giriş yapmanız gerekiyor');
            return;
          }

          const { error } = await supabase
            .from('templates')
            .insert({
              name: templateName,
              template_json: template,
              user_id: user.user.id,
              template_type: 'proposal',
              category: 'general',
              description: `Şablon tasarımcısı ile oluşturuldu`,
              is_active: true,
              variables: []
            });

          if (error) throw error;
          toast.success('Şablon kaydedildi');
        }
      } catch (error) {
        console.error('Kaydetme hatası:', error);
        toast.error('Şablon kaydedilemedi');
      }
    };

    return (
      <div className="flex h-[800px] gap-4">
        {/* Element Palette */}
        <ElementPalette onElementDragStart={handleElementDragStart} />

        {/* Ana Editör Alanı */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Üst Araç Çubuğu */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="text-lg">Şablon Tasarımcısı</CardTitle>
                  <Badge variant="secondary">
                    PDFme Editor
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Şablon adı..."
                    className="w-48"
                  />
                  <Separator orientation="vertical" className="h-6" />
                  <Button size="sm" variant="outline" onClick={handlePreview}>
                    <Eye className="w-4 h-4 mr-1" />
                    Önizle
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Kaydet
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* PDF Editör Alanı */}
          <Card className="flex-1">
            <CardContent className="p-4 h-full">
              <OfferPdfDesigner
                ref={pdfDesignerRef}
                initialTemplate={initialTemplate}
                onTemplateChange={handleTemplateChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
);

TemplateBuilder.displayName = 'TemplateBuilder';