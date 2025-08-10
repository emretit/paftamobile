import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface DragDropPDFEditorProps {
  initialTemplate?: any | null;
  onSave: (template: any) => void;
  onPreview?: (template: any) => void;
}



export const DragDropPDFEditor: React.FC<DragDropPDFEditorProps> = ({
  initialTemplate,
  onSave,
  onPreview
}) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const [designer, setDesigner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [templateName, setTemplateName] = useState('Yeni PDF Şablonu');

  useEffect(() => {
    const initializeDesigner = async () => {
      try {
        // Delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { Designer } = await import('@pdfme/ui');
        const { text, image, barcodes, table } = await import('@pdfme/schemas');
        
        if (designerRef.current && !designer) {
          const defaultTemplate = initialTemplate || {
            basePdf: { width: 210, height: 297, padding: [20, 20, 20, 20] },
            schemas: [{}]
          };

          console.log('Creating PDFme Designer with template:', defaultTemplate);

          // PDFme'nin schema'larını basit gruplarla hazırlayalım
          const predefinedSchemas = {
            // Temel Bilgiler
            'teklifBasligi': {
              type: 'text',
              position: { x: 20, y: 30 },
              width: 120,
              height: 12,
              fontSize: 18,
              fontColor: '#000000'
            },
            'teklifNo': {
              type: 'text',
              position: { x: 150, y: 30 },
              width: 60,
              height: 8,
              fontSize: 12,
              fontColor: '#000000'
            },
            'teklifTarihi': {
              type: 'text',
              position: { x: 20, y: 50 },
              width: 60,
              height: 8,
              fontSize: 10,
              fontColor: '#666666'
            },
            'gecerlilikTarihi': {
              type: 'text',
              position: { x: 90, y: 50 },
              width: 60,
              height: 8,
              fontSize: 10,
              fontColor: '#666666'
            },

            // Müşteri Bilgileri
            'musteriAdi': {
              type: 'text',
              position: { x: 20, y: 70 },
              width: 100,
              height: 10,
              fontSize: 14,
              fontColor: '#000000'
            },
            'musteriAdres': {
              type: 'text',
              position: { x: 20, y: 85 },
              width: 100,
              height: 20,
              fontSize: 10,
              fontColor: '#666666'
            },
            'musteriTelefon': {
              type: 'text',
              position: { x: 20, y: 110 },
              width: 80,
              height: 8,
              fontSize: 10,
              fontColor: '#666666'
            },

            // Ürün/Hizmet Tablosu
            'urunTablosu': {
              type: 'table',
              position: { x: 20, y: 130 },
              width: 170,
              height: 60,
              showHead: true,
              head: ["Ürün/Hizmet", "Miktar", "Birim", "Birim Fiyat", "Toplam"],
              headWidthPercentages: [45, 15, 15, 12.5, 12.5],
              tableStyles: { borderWidth: 0.5, borderColor: '#000000' },
              headStyles: { fontSize: 10, fontColor: '#ffffff', backgroundColor: '#2980ba' },
              bodyStyles: { fontSize: 9, fontColor: '#000000' }
            },

            // Mali Bilgiler
            'brutToplam': {
              type: 'text',
              position: { x: 140, y: 200 },
              width: 50,
              height: 8,
              fontSize: 12,
              fontColor: '#000000'
            },
            'indirim': {
              type: 'text',
              position: { x: 140, y: 215 },
              width: 50,
              height: 8,
              fontSize: 12,
              fontColor: '#000000'
            },
            'kdvTutari': {
              type: 'text',
              position: { x: 140, y: 230 },
              width: 50,
              height: 8,
              fontSize: 12,
              fontColor: '#000000'
            },
            'genelToplam': {
              type: 'text',
              position: { x: 140, y: 245 },
              width: 50,
              height: 10,
              fontSize: 14,
              fontColor: '#000000'
            },

            // Şartlar
            'odemeKosullari': {
              type: 'text',
              position: { x: 20, y: 260 },
              width: 170,
              height: 15,
              fontSize: 10,
              fontColor: '#666666'
            },
            'teslimatKosullari': {
              type: 'text',
              position: { x: 20, y: 280 },
              width: 170,
              height: 15,
              fontSize: 10,
              fontColor: '#666666'
            }
          };

          const designerInstance = new Designer({
            domContainer: designerRef.current,
            template: {
              ...defaultTemplate,
              schemas: [predefinedSchemas] // Tüm alanları PDFme'nin schema panel'ine ekle
            },
            inputs: [{ // Sample data ile başla ki alanlar görünsün
              teklifBasligi: 'Web Sitesi Geliştirme Projesi',
              teklifNo: 'TKL-2024-001',
              teklifTarihi: new Date().toLocaleDateString('tr-TR'),
              gecerlilikTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
              musteriAdi: 'XYZ İnşaat A.Ş.',
              musteriAdres: 'Sanayi Mah. İnşaat Cd. No:456\nKadıköy/İstanbul',
              musteriTelefon: '+90 216 555 0123',
              urunTablosu: [
                ['Web Sitesi Tasarımı', '1', 'Adet', '50.000 ₺', '50.000 ₺'],
                ['SEO Optimizasyonu', '1', 'Adet', '25.000 ₺', '25.000 ₺'],
                ['Hosting (1 Yıl)', '1', 'Adet', '5.000 ₺', '5.000 ₺']
              ],
              brutToplam: '80.000 ₺',
              indirim: '5.000 ₺',
              kdvTutari: '15.000 ₺',
              genelToplam: '90.000 ₺',
              odemeKosullari: 'Siparişle birlikte %50 avans, teslimde kalan tutar ödenecektir.',
              teslimatKosullari: 'Teslimat süresi: Sipariş tarihinden itibaren 15-20 iş günü'
            }],
            plugins: { text, image, qrcode: barcodes.qrcode, table },
            options: {
              theme: {
                token: {
                  colorPrimary: '#dc2626'
                }
              }
            }
          });

          setDesigner(designerInstance);
          setIsLoading(false);
          console.log('PDFme Designer initialized successfully');
        }
      } catch (error) {
        console.error('PDFMe initialization error:', error);
        toast.error('PDF tasarımcısı yüklenirken hata oluştu: ' + error.message);
        setIsLoading(false);
      }
    };

    if (designerRef.current) {
      initializeDesigner();
    }

    return () => {
      if (designer) {
        try {
          designer.destroy();
        } catch (error) {
          console.error('Designer destroy error:', error);
        }
      }
    };
  }, [initialTemplate, designer]);

  const handleSave = () => {
    if (designer) {
      try {
        const template = designer.getTemplate();
        onSave({ ...template, name: templateName });
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
    <div className="flex h-[800px] bg-gray-50 rounded-lg overflow-hidden">
      {/* PDF Designer Area - Full Width */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="templateName" className="text-sm font-medium">Şablon Adı</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1 w-64"
                placeholder="Şablon adını girin..."
              />
            </div>
            <div className="text-sm text-muted-foreground">
              🎯 PDF'teki alanları tıklayın, sağ panelde özelleştirin
            </div>
          </div>
          <div className="flex gap-2">
            {onPreview && (
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Önizleme
              </Button>
            )}
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </div>

        <div className="flex-1 relative bg-white">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <div className="text-sm text-muted-foreground">PDF tasarımcısı yükleniyor...</div>
              </div>
            </div>
          )}
          <div
            ref={designerRef}
            className="w-full h-full min-h-[600px]"
          />
        </div>
      </div>
    </div>
  );
};

export default DragDropPDFEditor;