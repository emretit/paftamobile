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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                companyLogo: {
                  type: 'image',
                  position: { x: 20, y: 24 },
                  width: 20,
                  height: 20
                },
                companyName: {
                  type: 'text',
                  position: { x: 45, y: 24 },
                  width: 100,
                  height: 10,
                  fontSize: 16,
                  fontColor: '#000000'
                },
                companyAddress: {
                  type: 'text',
                  position: { x: 45, y: 34 },
                  width: 100,
                  height: 8,
                  fontSize: 9,
                  fontColor: '#444444'
                },
                companyContact: {
                  type: 'text',
                  position: { x: 45, y: 42 },
                  width: 100,
                  height: 8,
                  fontSize: 9,
                  fontColor: '#444444'
                },
                proposalTitle: {
                  type: 'text',
                  position: { x: 20, y: 50 },
                  width: 170,
                  height: 10,
                  fontSize: 14,
                  fontColor: '#000000'
                },
                // Customer block
                customerName: {
                  type: 'text',
                  position: { x: 20, y: 70 },
                  width: 100,
                  height: 8,
                  fontSize: 12,
                  fontColor: '#000000'
                },
                customerAddress: {
                  type: 'text',
                  position: { x: 20, y: 78 },
                  width: 100,
                  height: 10,
                  fontSize: 9,
                  fontColor: '#444444'
                },
                customerTaxNo: {
                  type: 'text',
                  position: { x: 20, y: 88 },
                  width: 100,
                  height: 8,
                  fontSize: 9,
                  fontColor: '#444444'
                },
                // Proposal info block
                proposalNumber: {
                  type: 'text',
                  position: { x: 130, y: 70 },
                  width: 60,
                  height: 8,
                  fontSize: 10,
                  fontColor: '#000000'
                },
                createdDate: {
                  type: 'text',
                  position: { x: 130, y: 78 },
                  width: 60,
                  height: 8,
                  fontSize: 9,
                  fontColor: '#444444'
                },
                validUntil: {
                  type: 'text',
                  position: { x: 130, y: 86 },
                  width: 60,
                  height: 8,
                  fontSize: 9,
                  fontColor: '#444444'
                },
                proposalItemsTable: {
                  type: 'table',
                  position: { x: 20, y: 100 },
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
                    backgroundColor: '#2980ba'
                  },
                  bodyStyles: {
                    fontSize: 9,
                    fontColor: '#000000'
                  }
                },
                // Totals block
                subTotalLabel: {
                  type: 'text',
                  position: { x: 120, y: 152 },
                  width: 40,
                  height: 6,
                  fontSize: 9,
                  fontColor: '#444444',
                  content: 'Ara Toplam:'
                },
                subTotal: {
                  type: 'text',
                  position: { x: 160, y: 152 },
                  width: 30,
                  height: 6,
                  fontSize: 10,
                  fontColor: '#000000'
                },
                discountLabel: {
                  type: 'text',
                  position: { x: 120, y: 160 },
                  width: 40,
                  height: 6,
                  fontSize: 9,
                  fontColor: '#444444',
                  content: 'İndirim:'
                },
                discountAmount: {
                  type: 'text',
                  position: { x: 160, y: 160 },
                  width: 30,
                  height: 6,
                  fontSize: 10,
                  fontColor: '#000000'
                },
                netTotalLabel: {
                  type: 'text',
                  position: { x: 120, y: 168 },
                  width: 40,
                  height: 6,
                  fontSize: 9,
                  fontColor: '#444444',
                  content: 'Net Toplam:'
                },
                netTotal: {
                  type: 'text',
                  position: { x: 160, y: 168 },
                  width: 30,
                  height: 6,
                  fontSize: 12,
                  fontColor: '#000000'
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
                  height: 12,
                  fontSize: 10,
                  fontColor: '#333333'
                },
                // Terms & Conditions
                termsHeader: {
                  type: 'text',
                  position: { x: 20, y: 200 },
                  width: 170,
                  height: 8,
                  fontSize: 10,
                  fontColor: '#000000',
                  content: 'Şartlar ve Koşullar'
                },
                termsText: {
                  type: 'text',
                  position: { x: 20, y: 208 },
                  width: 170,
                  height: 60,
                  fontSize: 9,
                  fontColor: '#444444'
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PDF Şablon Tasarımcısı</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            if (!designer) return;
            const blankTemplate = {
              basePdf: { width: 210, height: 297, padding: [30, 20, 30, 20] },
              schemas: [{}]
            };
            designer.setTemplate(blankTemplate);
          }}>
            Boş Şablon
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !designer) return;
              try {
                const arrayBuffer = await file.arrayBuffer();
                const current = designer.getTemplate();
                designer.setTemplate({
                  ...current,
                  basePdf: arrayBuffer,
                  schemas: current?.schemas?.length ? current.schemas : [{}]
                });
                toast.success('PDF yüklendi');
              } catch (err) {
                toast.error('PDF yüklenemedi');
              } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            PDF Yükle
          </Button>
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
      
      <Card className="p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <div className="text-muted-foreground">PDF tasarımcısı yükleniyor...</div>
          </div>
        )}
        <div
          ref={designerRef}
          className="w-full h-[600px] border border-border rounded-md bg-background"
        />
      </Card>
    </div>
  );
};

export default PDFMeTemplateDesigner;