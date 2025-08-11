import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SimpleTemplateEditorProps {
  onSave?: (template: any) => void;
  onPreview?: (template: any) => void;
}

export const SimpleTemplateEditor: React.FC<SimpleTemplateEditorProps> = ({
  onSave,
  onPreview
}) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [templateName, setTemplateName] = useState('Yeni Şablon');
  const [designerInstance, setDesignerInstance] = useState<any>(null);

  useEffect(() => {
    const initializeDesigner = async () => {
      try {
        const { Designer } = await import('@pdfme/ui');
        const { text, image, barcodes } = await import('@pdfme/schemas');

        if (!designerRef.current) return;

        // Basit template tanımı
        const template = {
          basePdf: '', // Boş sayfa
          schemas: [
            {
              "companyName": {
                "type": "text",
                "position": { "x": 20, "y": 20 },
                "width": 100,
                "height": 10,
                "fontSize": 16,
                "fontColor": "#000000"
              },
              "proposalTitle": {
                "type": "text", 
                "position": { "x": 20, "y": 40 },
                "width": 100,
                "height": 10,
                "fontSize": 14,
                "fontColor": "#000000"
              },
              "customerName": {
                "type": "text",
                "position": { "x": 20, "y": 60 },
                "width": 100, 
                "height": 10,
                "fontSize": 12,
                "fontColor": "#000000"
              },
              "totalAmount": {
                "type": "text",
                "position": { "x": 20, "y": 80 },
                "width": 50,
                "height": 10,
                "fontSize": 12,
                "fontColor": "#000000"
              }
            }
          ]
        };

        // Designer'ı başlat
        const designer = new Designer({
          domContainer: designerRef.current,
          template,
          plugins: {
            text,
            image,
            qrcode: barcodes.qrcode
          }
        });

        setDesignerInstance(designer);
        setIsLoading(false);
        
        toast.success('Template editörü hazır!');

      } catch (error) {
        console.error('Designer initialization error:', error);
        toast.error('Template editörü başlatılamadı');
        setIsLoading(false);
      }
    };

    initializeDesigner();

    // Cleanup
    return () => {
      if (designerInstance) {
        designerInstance.destroy?.();
      }
    };
  }, []);

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

      const { error } = await supabase
        .from('templates')
        .insert({
          name: templateName,
          template_json: template,
          user_id: userRes.user.id
        });

      if (error) throw error;

      toast.success('Şablon kaydedildi!');
      onSave?.(template);

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
      const template = designerInstance.getTemplate();
      
      // Preview için generate kullan
      const { generate } = await import('@pdfme/generator');
      const { text, image, barcodes } = await import('@pdfme/schemas');

      // Örnek veri
      const sampleInputs = {
        companyName: 'ABC Teknoloji Ltd. Şti.',
        proposalTitle: 'Web Sitesi Geliştirme Projesi',
        customerName: 'XYZ İnşaat A.Ş.',
        totalAmount: '125.000 ₺'
      };

      const pdf = await generate({
        template,
        inputs: [sampleInputs],
        plugins: {
          text,
          image,
          qrcode: barcodes.qrcode
        }
      });

      // PDF'i yeni sekmede aç
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      toast.success('Önizleme oluşturuldu!');
      onPreview?.(template);

    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Önizleme oluşturulamadı');
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
            className={`min-h-[600px] w-full border rounded ${isLoading ? 'hidden' : ''}`}
          />
        </CardContent>
      </Card>
    </div>
  );
};
