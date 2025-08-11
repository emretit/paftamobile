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
          { text, image, barcodes, line, rectangle, ellipse, table, checkbox, radioGroup, select, multiVariableText, dateTime, signature },
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
                fontName: 'NotoSerifJP-Regular',
              },
              proposalTitle: {
                type: 'text',
                position: { x: 20, y: 40 },
                width: 100,
                height: 10,
                fontSize: 14,
                fontColor: '#666666',
                fontName: 'NotoSerifJP-Regular',
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
            signature,
          },
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

  const handlePreview = async () => {
    if (!designerInstance) {
      toast.error('Editör henüz hazır değil');
      return;
    }

    try {
      console.log('🎯 Preview başlatılıyor...');
      const template = designerInstance.getTemplate();
      console.log('📄 Template alındı:', template);
      
      // Preview için generate kullan
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes, line, rectangle, ellipse, table, checkbox, radioGroup, select, multiVariableText, dateTime, signature } = await import('@pdfme/schemas');
      console.log('🔧 Plugins yüklendi');

      // Şablondaki alanları kontrol et ve uygun örnek veri oluştur
      const sampleInputs: any = {};
      
      if (template.schemas && template.schemas[0]) {
        Object.keys(template.schemas[0]).forEach(key => {
          switch (key) {
            case 'companyName':
            case 'sirketBaslik':
              sampleInputs[key] = 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ';
              break;
            case 'proposalTitle':
            case 'teklifBaslik':
              sampleInputs[key] = 'TEKLİF FORMU';
              break;
            case 'customerName':
            case 'musteriBaslik':
              sampleInputs[key] = 'BAHÇEŞEHİR GÖLEVLERİ SİTESİ';
              break;
            case 'totalAmount':
            case 'toplamDeger':
              sampleInputs[key] = '1.320,00 $';
              break;
            // PDFme Quote Template alanları
            case 'head':
              sampleInputs[key] = 'QUOTE';
              break;
            case 'preparedForLabel':
              sampleInputs[key] = 'Prepared for:';
              break;
            case 'preparedForInput':
              sampleInputs[key] = 'İmam Dîane\n+123 456 7890\n63 İvy Road, Hawkville, GA, USA 31036';
              break;
            case 'quoteInfo':
              sampleInputs[key] = 'Quote No: 12345\n18 June 2025\nValid Until: 16 July 2025';
              break;
            case 'subtotalLabel':
              sampleInputs[key] = 'Subtotal';
              break;
            case 'subtotal':
              sampleInputs[key] = '377';
              break;
            case 'taxInput':
              sampleInputs[key] = 'Tax (10%)';
              break;
            case 'tax':
              sampleInputs[key] = '37.7';
              break;
            case 'totalLabel':
              sampleInputs[key] = 'Total';
              break;
            case 'total':
              sampleInputs[key] = '$414.7';
              break;
            case 'thankyou':
              sampleInputs[key] = 'Thank you for your interest!';
              break;
            case 'date':
            case 'tarihDeger':
              sampleInputs[key] = new Date().toLocaleDateString('tr-TR');
              break;
            case 'teklifNoDeger':
              sampleInputs[key] = 'NT.2508-1364.01';
              break;
            case 'hazirlayanDeger':
              sampleInputs[key] = 'Nurettin Emre AYDIN';
              break;
            case 'brutToplamDeger':
              sampleInputs[key] = '1.100,00 $';
              break;
            case 'kdvDeger':
              sampleInputs[key] = '220,00 $';
              break;
            case 'urunTablosu':
              sampleInputs[key] = [
                ['1', 'IP Kamera Sistemi', '10', '100$', '1.000$'],
                ['2', 'Kurulum ve Ayar', '1', '100$', '100$']
              ];
              break;
            default:
              sampleInputs[key] = `Örnek ${key}`;
          }
        });
      } else {
        // Fallback örnek veriler
        sampleInputs.companyName = 'NGS TEKNOLOJİ';
        sampleInputs.proposalTitle = 'TEKLİF FORMU';
        sampleInputs.customerName = 'ÖRNEK MÜŞTERİ';
        sampleInputs.totalAmount = '1.320,00 $';
      }
      
      console.log('📊 Örnek veriler hazırlandı:', sampleInputs);

      console.log('🏗️ PDF oluşturuluyor...');
      const pdf = await generate({
        template,
        inputs: [sampleInputs],
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
          signature
        }
      });

      console.log('✅ PDF oluşturuldu! Boyut:', pdf.buffer.byteLength, 'bytes');
      
      // PDF'i yeni sekmede aç
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      console.log('🚀 PDF yeni sekmede açılıyor...');
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        console.warn('⚠️ Popup engellendi, link olarak indirme önerilecek');
        toast.error('Popup engellendi. Lütfen popup engelleyiciyi devre dışı bırakın.');
        
        // Alternatif: Download linki
        const link = document.createElement('a');
        link.href = url;
        link.download = `onizleme-${Date.now()}.pdf`;
        link.click();
        toast.success('PDF indirildi!');
      } else {
        toast.success('Önizleme yeni sekmede açıldı! 🎉');
      }
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
        console.log('🧹 URL temizlendi');
      }, 10000);

      onPreview?.(template);

    } catch (error) {
      console.error('❌ Preview hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error(`Önizleme oluşturulamadı: ${error.message}`);
    }
  };

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
            <Button variant="outline" onClick={handlePreview} disabled={isLoading}>
              👁️ Önizle
            </Button>
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
          />
        </CardContent>
      </Card>
    </div>
  );
};
