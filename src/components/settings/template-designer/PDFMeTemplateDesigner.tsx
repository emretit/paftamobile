import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PDFMeTemplateDesignerProps {
  initialTemplate?: any | null;
  onSave: (template: any) => void;
  onPreview?: (template: any) => void;
}

export const PDFMeTemplateDesigner: React.FC<PDFMeTemplateDesignerProps> = ({
  initialTemplate,
  onSave,
  onPreview
}) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [designer, setDesigner] = useState<any>(null);

  useEffect(() => {
    const initializeDesigner = async () => {
      try {
        // Dynamically import PDFMe to avoid SSR issues
        const { Designer } = await import('@pdfme/ui');
        const { text, image, barcodes } = await import('@pdfme/schemas');
        
        if (designerRef.current) {
          const defaultTemplate = {
            basePdf: { width: 210, height: 297 },
            schemas: [[{
              companyName: {
                type: 'text',
                position: { x: 20, y: 20 },
                width: 100,
                height: 10,
                fontSize: 16,
                fontColor: '#000000'
              },
              proposalTitle: {
                type: 'text',
                position: { x: 20, y: 40 },
                width: 170,
                height: 10,
                fontSize: 14,
                fontColor: '#000000'
              },
              customerName: {
                type: 'text',
                position: { x: 20, y: 60 },
                width: 100,
                height: 8,
                fontSize: 12,
                fontColor: '#000000'
              },
              totalAmount: {
                type: 'text',
                position: { x: 20, y: 80 },
                width: 100,
                height: 8,
                fontSize: 12,
                fontColor: '#000000'
              }
            }]]
          };

          const designerInstance = new Designer({
            domContainer: designerRef.current,
            template: initialTemplate || defaultTemplate,
            plugins: { text, image, qrcode: barcodes.qrcode } as any
          });

          setDesigner(designerInstance);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('PDFMe initialization error:', error);
        toast.error('PDF tasarımcısı yüklenirken hata oluştu');
        setIsLoading(false);
      }
    };

    initializeDesigner();

    return () => {
      if (designer) {
        designer.destroy();
      }
    };
  }, []);

  const handleSave = () => {
    if (designer) {
      try {
        const template = designer.getTemplate();
        onSave(template);
        toast.success('Şablon kaydedildi');
      } catch (error) {
        console.error('Template save error:', error);
        toast.error('Şablon kaydedilemedi');
      }
    }
  };

  const handlePreview = () => {
    if (designer && onPreview) {
      try {
        const template = designer.getTemplate();
        onPreview(template);
      } catch (error) {
        console.error('Template preview error:', error);
        toast.error('Önizleme oluşturulamadı');
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-muted-foreground">PDF tasarımcısı yükleniyor...</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PDF Şablon Tasarımcısı</h3>
        <div className="flex gap-2">
          {onPreview && (
            <Button variant="outline" onClick={handlePreview}>
              Önizleme
            </Button>
          )}
          <Button onClick={handleSave}>
            Kaydet
          </Button>
        </div>
      </div>
      
      <Card className="p-4">
        <div 
          ref={designerRef} 
          className="w-full h-[600px] border border-border rounded-md bg-background"
        />
      </Card>
    </div>
  );
};

export default PDFMeTemplateDesigner;