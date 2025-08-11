import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SimpleTemplateEditorProps {
  onSave?: () => void;
  onPreview?: (template: any) => void;
  initialTemplate?: any;
  initialName?: string;
  templateId?: string;
}

export const SimpleTemplateEditor: React.FC<SimpleTemplateEditorProps> = ({
  onSave,
  onPreview,
  initialTemplate,
  initialName,
  templateId,
}) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [templateName, setTemplateName] = useState(initialName ?? 'Yeni Şablon');
  const [designerInstance, setDesignerInstance] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    
    const initializeDesigner = async () => {
      console.log('🚀 Designer initialization başlıyor...');
      
      if (!designerRef.current) {
        console.error('❌ designerRef.current bulunamadı');
        return;
      }

      try {
        console.log('📦 PDFme modülleri yükleniyor...');
        const [
          { Designer },
          { text, image, barcodes, line, rectangle, ellipse, table, checkbox, radioGroup, select, multiVariableText, dateTime },
          { BLANK_PDF }
        ] = await Promise.all([
          import('@pdfme/ui'),
          import('@pdfme/schemas'),
          import('@pdfme/common')
        ]);

        if (!mounted) return;

        console.log('✅ PDFme modülleri yüklendi');

        // Template hazırla
        const template = initialTemplate ? JSON.parse(JSON.stringify(initialTemplate)) : {
          basePdf: BLANK_PDF,
          schemas: [
            {
              companyName: {
                type: 'text',
                position: { x: 20, y: 20 },
                width: 150,
                height: 12,
                fontSize: 16,
                fontColor: '#000000',
                // fontName kaldırıldı - default font kullanılacak
              },
              proposalTitle: {
                type: 'text',
                position: { x: 20, y: 40 },
                width: 100,
                height: 10,
                fontSize: 14,
                fontColor: '#666666',
                // fontName kaldırıldı - default font kullanılacak
              },
            },
          ],
        };

        if (template.basePdf === 'BLANK_PDF') {
          template.basePdf = BLANK_PDF;
        }

        console.log('📄 Template hazırlandı:', template);

        // Container'ı temizle
        if (designerRef.current) {
          designerRef.current.innerHTML = '';
        }

        console.log('🎨 Designer oluşturuluyor...');

        // Designer oluştur
        const designer = new Designer({
          domContainer: designerRef.current,
          template,
          plugins: {
            text,
            image,
            qrcode: barcodes.qrcode,
            ean13: barcodes.ean13,
            japanpost: barcodes.japanpost,
            line,
            rectangle,
            ellipse,
            table,
            checkbox,
            radioGroup,
            select,
            multiVariableText,
            dateTime,
            // signature geçici olarak kaldırıldı
          } as any,
          options: {
            zoomLevel: 1.0,
            sidebarOpen: true,
            lang: 'en',
          },
        });

        if (!mounted) {
          designer.destroy?.();
          return;
        }

        console.log('✅ Designer oluşturuldu');
        setDesignerInstance(designer);
        setIsLoading(false);
        
        // Başarı mesajını delay ile göster
        setTimeout(() => {
          if (mounted) {
            toast.success('PDF editörü başarıyla yüklendi!');
          }
        }, 500);

      } catch (error) {
        console.error('❌ Designer initialization error:', error);
        if (mounted) {
          toast.error(`Editör başlatılamadı: ${error.message}`);
          setIsLoading(false);
        }
      }
    };

    // DOM ready bekle
    setTimeout(() => {
      if (mounted && designerRef.current) {
        initializeDesigner();
      }
    }, 100);

    // Cleanup
    return () => {
      mounted = false;
      if (designerInstance) {
        try {
          designerInstance.destroy?.();
        } catch (error) {
          console.warn('Designer destroy error:', error);
        }
      }
    };
  }, [initialTemplate]);

  // initialName değişince inputu güncelle
  useEffect(() => {
    if (initialName) setTemplateName(initialName);
  }, [initialName]);

  const handleSave = async () => {
    if (!designerInstance) {
      toast.error('Editör henüz hazır değil');
      return;
    }

    try {
      const template = designerInstance.getTemplate();
      
      // Supabase'e kaydet
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        toast.error('Giriş yapmanız gerekiyor');
        return;
      }

      let error: any = null;
      if (templateId) {
        // Güncelleme
        const res = await supabase
          .from('templates')
          .update({
            name: templateName,
            template_json: template,
            updated_at: new Date().toISOString(),
          })
          .eq('id', templateId);
        error = res.error;
      } else {
        // Yeni kayıt
        const res = await supabase
          .from('templates')
          .insert({
            name: templateName,
            template_json: template,
            user_id: userRes.user.id,
            template_type: 'proposal',
            category: 'general',
            description: 'PDFme editörü ile oluşturulan şablon',
            is_active: true,
            variables: []
          });
        error = res.error;
      }

      if (error) throw error;

      toast.success('Şablon kaydedildi!');
      onSave?.();

    } catch (error) {
      console.error('Save error:', error);
      toast.error('Şablon kaydedilemedi');
    }
  };

  const handleGeneratePdf = async () => {
    console.log('🚀 PDF Generate başlıyor...');
    console.log('Designer instance:', designerInstance);
    console.log('IsLoading:', isLoading);
    
    if (!designerInstance) {
      console.error('❌ Designer instance bulunamadı');
      toast.error('Editör henüz hazır değil. Lütfen sayfayı yenileyin.');
      return;
    }

    try {
      console.log('📄 Template alınıyor...');
      const template = designerInstance.getTemplate();
      console.log('Template alındı:', template);
      
      if (!template || !template.schemas) {
        toast.error('Şablon verisi eksik. Lütfen template oluşturun.');
        return;
      }

      const { generateAndDownloadPdf, generateSampleData } = await import('@/lib/pdf-utils');

      console.log('🔄 Örnek veriler oluşturuluyor...');
      const sampleInputs = generateSampleData(template);
      console.log('Örnek veriler:', sampleInputs);

      console.log('📑 PDF oluşturuluyor...');
      const success = await generateAndDownloadPdf(template, sampleInputs, templateName || 'sablon');
      
      if (success) {
        console.log('✅ PDF başarıyla oluşturuldu');
        onPreview?.(template);
      }
    } catch (error: any) {
      console.error('❌ PDF Generate hatası:', error);
      console.error('Error stack:', error.stack);
      toast.error(`PDF oluşturulamadı: ${error?.message || 'Bilinmeyen hata'}`);
    }
  };

  function defaultSampleFor(field: string) {
    const f = field.toLowerCase();
    if (f.includes('company')) return 'NGS TEKNOLOJİ';
    if (f.includes('title') || f.includes('baslik')) return 'TEKLİF FORMU';
    if (f.includes('name') || f.includes('musteri')) return 'ÖRNEK MÜŞTERİ';
    if (f.includes('date') || f.includes('tarih')) return new Date().toLocaleDateString('tr-TR');
    if (f.includes('total') || f.includes('amount') || f.includes('tutar')) return '8.260,00 ₺';
    return `Örnek ${field}`;
  }

  return (
    <div className="space-y-4">
      {/* Template Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle>Şablon Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="templateName">Şablon Adı</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Şablon adını girin..."
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading}>
              💾 Kaydet
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                console.log('Önizle butonu tıklandı!');
                handleGeneratePdf();
              }}
              disabled={isLoading || !designerInstance} 
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100"
            >
              👁️ Önizle
            </Button>
            {/* Debug bilgiler */}
            <div className="text-xs text-gray-500 ml-2 self-center">
              {isLoading ? 'Yükleniyor...' : !designerInstance ? 'Editör hazır değil' : 'Hazır'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Designer */}
      <Card>
        <CardHeader>
          <CardTitle>PDF Şablon Editörü</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">PDF editörü yükleniyor...</p>
              </div>
            </div>
          )}
          
          <div 
            ref={designerRef} 
            className={`pdfme-designer-container w-full border rounded ${isLoading ? 'hidden' : ''}`}
            style={{
              minHeight: '800px',
              height: '800px',
              '--pdfme-sidebar-bg': 'hsl(var(--background))',
              '--pdfme-sidebar-border': 'hsl(var(--border))',
              '--pdfme-sidebar-text': 'hsl(var(--foreground))',
              '--pdfme-button-bg': 'hsl(var(--secondary))',
              '--pdfme-button-hover': 'hsl(var(--secondary)/0.8)',
              '--pdfme-button-text': 'hsl(var(--secondary-foreground))',
              '--pdfme-accent': 'hsl(var(--primary))',
              '--pdfme-accent-hover': 'hsl(var(--primary)/0.9)',
            } as React.CSSProperties & Record<string, string>}
          />
        </CardContent>
      </Card>
    </div>
  );
};
