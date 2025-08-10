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
        const { text, image, barcodes, table } = await import('@pdfme/schemas');
        
        if (designerRef.current) {
          const defaultTemplate = {
            basePdf: { width: 210, height: 297, padding: [30, 20, 30, 20] }, // Top/bottom padding için alan
            schemas: [
              // Header schema (her sayfada tekrarlanır)
              {
                companyHeader: {
                  type: 'text',
                  position: { x: 20, y: 10 },
                  width: 100,
                  height: 8,
                  fontSize: 12,
                  fontColor: '#666666',

                  content: 'Şirket Adı',
                  readOnly: true
                },
                headerLine: {
                  type: 'text',
                  position: { x: 20, y: 18 },
                  width: 170,
                  height: 1,
                  fontSize: 8,
                  backgroundColor: '#cccccc',
                  content: ' ',
                  readOnly: true
                },
                pageNumber: {
                  type: 'text',
                  position: { x: 150, y: 10 },
                  width: 40,
                  height: 8,
                  fontSize: 10,
                  fontColor: '#666666',
                  content: 'Sayfa {currentPage}/{totalPages}',
                  readOnly: true
                }
              },
              // Main content schema
              {
                companyName: {
                  type: 'text',
                  position: { x: 20, y: 30 },
                  width: 100,
                  height: 10,
                  fontSize: 16,
                  fontColor: '#000000',
                  fontName: 'NotoSans'
                },
                proposalTitle: {
                  type: 'text',
                  position: { x: 20, y: 50 },
                  width: 170,
                  height: 10,
                  fontSize: 14,
                  fontColor: '#000000',
                  fontName: 'NotoSans'
                },
                customerName: {
                  type: 'text',
                  position: { x: 20, y: 70 },
                  width: 100,
                  height: 8,
                  fontSize: 12,
                  fontColor: '#000000',
                  fontName: 'NotoSans'
                },
                proposalItemsTable: {
                  type: 'table',
                  position: { x: 20, y: 90 },
                  width: 170,
                  height: 50,
                  content: '[["Ürün/Hizmet","Miktar","Birim","Birim Fiyat","Toplam"],["Web Sitesi","1","Adet","50.000 ₺","50.000 ₺"]]',
                  showHead: true,
                  head: ["Ürün/Hizmet", "Miktar", "Birim", "Birim Fiyat", "Toplam"],
                  headWidthPercentages: [40, 15, 15, 15, 15],
                  tableStyles: {
                    borderWidth: 0.5,
                    borderColor: '#000000'
                  },
                  headStyles: {
                    fontSize: 10,
                    fontColor: '#ffffff',
                    backgroundColor: '#2980ba',
                    fontName: 'NotoSans'
                  },
                  bodyStyles: {
                    fontSize: 9,
                    fontColor: '#000000',
                    fontName: 'NotoSans'
                  }
                },
                totalAmount: {
                  type: 'text',
                  position: { x: 120, y: 150 },
                  width: 70,
                  height: 8,
                  fontSize: 12,
                  fontColor: '#000000',


                },
                proposalQRCode: {
                  type: 'qrcode',
                  position: { x: 20, y: 160 },
                  width: 30,
                  height: 30,
                  backgroundColor: '#ffffff',
                  color: '#000000'
                },
                proposalSummary: {
                  type: 'text',
                  position: { x: 60, y: 160 },
                  width: 130,
                  height: 20,
                  fontSize: 10,
                  fontColor: '#333333',
                  fontName: 'NotoSans'
                }
              },
              // Footer schema (her sayfada tekrarlanır)
              {
                footerLine: {
                  type: 'text',
                  position: { x: 20, y: 280 },
                  width: 170,
                  height: 1,
                  fontSize: 8,
                  backgroundColor: '#cccccc',
                  content: ' ',
                  readOnly: true
                },
                currentDate: {
                  type: 'text',
                  position: { x: 20, y: 285 },
                  width: 80,
                  height: 8,
                  fontSize: 9,
                  fontColor: '#666666',

                  content: '{date}',
                  readOnly: true
                },
                companyFooter: {
                  type: 'text',
                  position: { x: 110, y: 285 },
                  width: 80,
                  height: 8,
                  fontSize: 9,
                  fontColor: '#666666',
                  content: 'www.sirketadi.com | info@sirketadi.com',
                  readOnly: true
                }
              }
            ]
          };

          const designerInstance = new Designer({
            domContainer: designerRef.current,
            template: initialTemplate || defaultTemplate,
            plugins: { text, image, qrcode: barcodes.qrcode, table } as any
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