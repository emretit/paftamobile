import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OfferPdfDesignerProps {
  initialTemplate?: any;
  onTemplateChange?: (template: any) => void;
  disabled?: boolean;
}

export interface OfferPdfDesignerHandle {
  getTemplate: () => any;
}

export const OfferPdfDesigner = forwardRef<OfferPdfDesignerHandle, OfferPdfDesignerProps>(({
  initialTemplate,
  onTemplateChange,
  disabled = false,
}, ref) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [designerInstance, setDesignerInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTemplate, setCurrentTemplate] = useState<any>(initialTemplate);

  useImperativeHandle(ref, () => ({
    getTemplate: () => {
      if (designerInstance) {
        return designerInstance.getTemplate();
      }
      return currentTemplate;
    },
  }));

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
  }, []);

  useEffect(() => {
    if (designerInstance && initialTemplate) {
      try {
        designerInstance.updateTemplate(initialTemplate);
        setCurrentTemplate(initialTemplate);
      } catch (error) {
        console.error('Error updating template:', error);
      }
    }
  }, [initialTemplate, designerInstance]);

  const initializeDesigner = async () => {
    if (!designerRef.current) return;

    try {
      setIsLoading(true);

      // Dynamic import to avoid SSR issues
      const [
        { Designer },
        { text, image, table },
        { BLANK_PDF }
      ] = await Promise.all([
        import('@pdfme/ui'),
        import('@pdfme/schemas'),
        import('@pdfme/common')
      ]);

      // Default template structure
      const defaultTemplate = initialTemplate || {
        basePdf: BLANK_PDF,
        schemas: [
          {
            title: {
              type: 'text',
              position: { x: 20, y: 20 },
              width: 200,
              height: 20,
              content: 'Sample Title',
            },
          },
        ],
      };

      // Clear container
      designerRef.current.innerHTML = '';

      // Create designer instance
      const designer = new Designer({
        domContainer: designerRef.current,
        template: defaultTemplate,
        plugins: { text, image, table } as any,
        options: {
          lang: 'en',
        },
      });

      // Listen for template changes
      const handleTemplateChange = () => {
        if (!disabled) {
          const newTemplate = designer.getTemplate();
          setCurrentTemplate(newTemplate);
          onTemplateChange?.(newTemplate);
        }
      };

      // Set up event listeners
      designer.onChangeTemplate = handleTemplateChange;

      setDesignerInstance(designer);
      setCurrentTemplate(defaultTemplate);
      toast.success('PDF Tasarımcı yüklendi');

    } catch (error: any) {
      console.error('Error initializing designer:', error);
      toast.error(`PDF Tasarımcı yüklenemedi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!designerInstance) {
      toast.error('Tasarımcı hazır değil');
      return;
    }

    try {
      const template = designerInstance.getTemplate();
      
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">PDF Tasarımcı</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          disabled={isLoading || !designerInstance || disabled}
        >
          <Eye className="h-4 w-4 mr-2" />
          Önizle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">PDF Tasarımcı yükleniyor...</p>
              </div>
            </div>
          ) : (
            <div
              ref={designerRef}
              className="w-full border rounded"
              style={{
                minHeight: '500px',
                height: '60vh',
                backgroundColor: '#f8f9fa',
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
});

OfferPdfDesigner.displayName = 'OfferPdfDesigner';