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

export interface TemplateBuilderHandle {
  getTemplate: () => any;
}

export const TemplateBuilder = forwardRef<TemplateBuilderHandle, TemplateBuilderProps>(
  ({ initialTemplate, onTemplateChange, onSave }, ref) => {
    const [designerInstance, setDesignerInstance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTemplate, setCurrentTemplate] = useState<any>(null);
    const [templateName, setTemplateName] = useState('Yeni Şablon');
    const [droppedElements, setDroppedElements] = useState<DroppedElement[]>([]);
    const [selectedElement, setSelectedElement] = useState<DroppedElement | null>(null);
    const designerRef = useRef<HTMLDivElement>(null);
    const [draggedElement, setDraggedElement] = useState<PredefinedElement | null>(null);

    useImperativeHandle(ref, () => ({
      getTemplate: () => {
        if (designerInstance) {
          return designerInstance.getTemplate();
        }
        return currentTemplate;
      }
    }));

    useEffect(() => {
      initializeDesigner();
      return () => {
        if (designerInstance) {
          designerInstance.destroy();
        }
      };
    }, []);

    useEffect(() => {
      if (initialTemplate && designerInstance) {
        designerInstance.updateTemplate(initialTemplate);
        setCurrentTemplate(initialTemplate);
      }
    }, [initialTemplate, designerInstance]);

    const initializeDesigner = async () => {
      if (!designerRef.current) return;

      try {
        setIsLoading(true);
        
        // PDFme'yi dinamik olarak import et
        const { Designer } = await import('@pdfme/ui');
        const { text, image, line, rectangle, table } = await import('@pdfme/schemas');
        const { BLANK_PDF } = await import('@pdfme/common');

        // Başlangıç şablonu
        const defaultTemplate = initialTemplate || {
          basePdf: BLANK_PDF,
          schemas: [{}],
          sampledata: [{}]
        };

        // Designer'ı oluştur (TypeScript hatalarını önlemek için any kullanıyoruz)
        const designer = new Designer({
          domContainer: designerRef.current,
          template: defaultTemplate,
          plugins: { text, image, line, rectangle, table }
        } as any);

        // Template değişikliklerini dinle
        designer.onChangeTemplate((template: any) => {
          setCurrentTemplate(template);
          onTemplateChange?.(template);
        });

        setDesignerInstance(designer);
        setCurrentTemplate(defaultTemplate);
        setIsLoading(false);

      } catch (error) {
        console.error('Designer başlatma hatası:', error);
        toast.error('Şablon editörü başlatılamadı');
        setIsLoading(false);
      }
    };

    const handleElementDragStart = (element: PredefinedElement) => {
      setDraggedElement(element);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      
      if (!draggedElement || !designerRef.current) return;

      // Drop koordinatlarını hesapla
      const rect = designerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Yeni element oluştur
      const newElement: DroppedElement = {
        ...draggedElement,
        instanceId: `${draggedElement.id}_${Date.now()}`,
        position: { x, y },
      };

      // Designer'a field ekle
      if (designerInstance && currentTemplate) {
        const updatedSchemas = [...currentTemplate.schemas];
        if (!updatedSchemas[0]) updatedSchemas[0] = {};
        
        updatedSchemas[0][newElement.instanceId] = {
          type: newElement.type === 'multiline' ? 'text' : newElement.type,
          position: { x: newElement.position.x, y: newElement.position.y },
          width: newElement.defaultProps.width,
          height: newElement.defaultProps.height,
          fontSize: newElement.defaultProps.fontSize || 12,
          fontName: newElement.defaultProps.fontName || 'Helvetica',
          alignment: newElement.defaultProps.alignment || 'left',
          fontColor: newElement.defaultProps.fontColor || '#000000',
          backgroundColor: newElement.defaultProps.backgroundColor,
          borderWidth: newElement.defaultProps.borderWidth,
          borderColor: newElement.defaultProps.borderColor,
        };

        const updatedTemplate = {
          ...currentTemplate,
          schemas: updatedSchemas
        };

        designerInstance.updateTemplate(updatedTemplate);
        setDroppedElements(prev => [...prev, newElement]);
        
        toast.success(`${newElement.label} eklendi`);
      }

      setDraggedElement(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handlePreview = async () => {
      if (!designerInstance) return;

      try {
        const template = designerInstance.getTemplate();
        const { generate } = await import('@pdfme/generator');
        
        // Örnek veriler oluştur
        const sampleData = {};
        droppedElements.forEach(element => {
          sampleData[element.instanceId] = getSampleDataForElement(element);
        });

        const pdf = await generate({
          template,
          inputs: [sampleData]
        });

        // PDF'i yeni sekmede aç
        const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url);

      } catch (error) {
        console.error('Preview hatası:', error);
        toast.error('Önizleme oluşturulamadı');
      }
    };

    const getSampleDataForElement = (element: DroppedElement): string => {
      switch (element.id) {
        case 'companyName': return 'ÖRNEK ŞİRKET A.Ş.';
        case 'companyAddress': return 'Örnek Mahallesi, Örnek Caddesi No:123\n34000 İSTANBUL';
        case 'companyPhone': return '+90 212 555 0123';
        case 'companyEmail': return 'info@ornek.com';
        case 'customerName': return 'MÜŞTERİ FİRMA ADI';
        case 'customerAddress': return 'Müşteri Adresi\n35000 İZMİR';
        case 'customerPhone': return '+90 232 555 0456';
        case 'customerEmail': return 'musteri@firma.com';
        case 'proposalTitle': return 'TEKLİF FORMU';
        case 'proposalNumber': return 'TKL-2024-001';
        case 'proposalDate': return new Date().toLocaleDateString('tr-TR');
        case 'validUntil': return new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('tr-TR');
        case 'subtotal': return '10.000,00 ₺';
        case 'taxAmount': return '1.800,00 ₺';
        case 'totalAmount': return '11.800,00 ₺';
        case 'taxRate': return '%18';
        case 'paymentTerms': return 'Ödeme: Teslimattan sonra 30 gün vadeli';
        case 'deliveryTerms': return 'Teslimat: 7-10 iş günü';
        case 'notes': return 'Bu teklif 30 gün geçerlidir.';
        default: return `Örnek ${element.label}`;
      }
    };

    const handleSave = async () => {
      if (!designerInstance) return;

      try {
        const template = designerInstance.getTemplate();
        
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
              description: `${droppedElements.length} element içeren şablon`,
              is_active: true,
              variables: droppedElements.map(el => ({
                name: el.name,
                label: el.label,
                type: el.type,
                binding: el.dataBinding
              }))
            });

          if (error) throw error;
          toast.success('Şablon kaydedildi');
        }
      } catch (error) {
        console.error('Kaydetme hatası:', error);
        toast.error('Şablon kaydedilemedi');
      }
    };

    const clearTemplate = () => {
      if (designerInstance) {
        const emptyTemplate = {
          basePdf: undefined,
          schemas: [{}],
          sampledata: [{}]
        };
        designerInstance.updateTemplate(emptyTemplate);
        setDroppedElements([]);
        toast.success('Şablon temizlendi');
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
                    {droppedElements.length} element
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
                  <Button size="sm" variant="outline" onClick={clearTemplate}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Temizle
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
            <CardContent className="p-0 h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Editör yükleniyor...</p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={designerRef}
                  className="h-full min-h-96 bg-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                />
              )}
            </CardContent>
          </Card>

          {/* Alt Bilgi Çubuğu */}
          {droppedElements.length > 0 && (
            <Card>
              <CardContent className="py-3">
                <div className="text-sm text-muted-foreground">
                  <strong>Eklenen Elementler:</strong> {' '}
                  {droppedElements.map(el => el.label).join(', ')}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
);

TemplateBuilder.displayName = 'TemplateBuilder';