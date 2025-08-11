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

          // Gerçekçi Türkçe teklif formu şablonu
          const predefinedSchemas = {
            // Şirket Logo ve Bilgileri
            'sirketLogo': {
              type: 'text',
              position: { x: 20, y: 15 },
              width: 40,
              height: 15,
              fontSize: 16,
              fontColor: '#dc2626',
              fontName: 'NotoSansCJKjp-Regular',
              content: 'ŞİRKET LOGO'
            },
            'sirketAdi': {
              type: 'text',
              position: { x: 20, y: 35 },
              width: 100,
              height: 8,
              fontSize: 12,
              fontColor: '#000000',
              content: 'ŞİRKETİNİZ TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ'
            },
            'sirketAdres': {
              type: 'text',
              position: { x: 20, y: 45 },
              width: 80,
              height: 6,
              fontSize: 8,
              fontColor: '#666666',
              content: 'Merkez: Eğitim mah. Muratpaşa cad. No:1 D:29-30 Kadıköy, İstanbul'
            },
            'sirketSubeAdres': {
              type: 'text',
              position: { x: 20, y: 52 },
              width: 80,
              height: 6,
              fontSize: 8,
              fontColor: '#666666',
              content: 'Şube: Topçular Mah. İşgören Sok. No: 2 A Keresteciler Sit. Eyüp, İstanbul'
            },

            // Teklif Formu Başlığı
            'teklifFormuBaslik': {
              type: 'text',
              position: { x: 85, y: 70 },
              width: 40,
              height: 12,
              fontSize: 16,
              fontColor: '#000000',
              content: 'TEKLİF FORMU'
            },

            // Sağ üst tarih ve bilgiler
            'tarih': {
              type: 'text',
              position: { x: 150, y: 15 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Tarih: 08.08.2025'
            },
            'gecerlilik': {
              type: 'text',
              position: { x: 150, y: 22 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Geçerlilik: 15.08.2025'
            },
            'teklifNo': {
              type: 'text',
              position: { x: 150, y: 29 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Teklif No: NT.2508-1364.01'
            },
            'hazirlayan': {
              type: 'text',
              position: { x: 150, y: 36 },
              width: 40,
              height: 6,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Hazırlayan: Nurettin Emre AYDIN'
            },

            // Müşteri bilgileri başlığı
            'musteriBaslik': {
              type: 'text',
              position: { x: 20, y: 85 },
              width: 100,
              height: 8,
              fontSize: 12,
              fontColor: '#000000',
              content: 'BAHÇEŞEHİR GÖLEVLERİ SİTESİ'
            },
            'musteriDetay': {
              type: 'text',
              position: { x: 20, y: 95 },
              width: 170,
              height: 15,
              fontSize: 9,
              fontColor: '#666666',
              content: 'Sayın\nMustafa Bey,\nYapmış olduğumuz görüşmeler sonrasında hazırlamış olduğumuz fiyat teklifimizi değerlendirmenize sunarız.'
            },

            // Ürün tablosu
            'urunTablosu': {
              type: 'table',
              position: { x: 20, y: 120 },
              width: 170,
              height: 80,
              showHead: true,
              head: ["No", "Açıklama", "BİLGİSAYAR", "Miktar", "Fiyat", "Tutar (KDV Hariç)"],
              headWidthPercentages: [8, 35, 25, 12, 10, 10],
              tableStyles: { 
                borderWidth: 0.5, 
                borderColor: '#000000',
                cellPadding: 2
              },
              headStyles: { 
                fontSize: 9, 
                fontColor: '#ffffff', 
                backgroundColor: '#dc2626',
                alignment: 'center'
              },
              bodyStyles: { 
                fontSize: 8, 
                fontColor: '#000000',
                alignment: 'left'
              }
            },

            // Mali özet
            'brutToplam': {
              type: 'text',
              position: { x: 140, y: 210 },
              width: 25,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: 'Brüt Toplam'
            },
            'brutToplamTutar': {
              type: 'text',
              position: { x: 170, y: 210 },
              width: 20,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: '1.100,00 $'
            },
            'indirim': {
              type: 'text',
              position: { x: 140, y: 220 },
              width: 25,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: 'İndirim'
            },
            'indirimTutar': {
              type: 'text',
              position: { x: 170, y: 220 },
              width: 20,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: '0,00 $'
            },
            'netToplam': {
              type: 'text',
              position: { x: 140, y: 230 },
              width: 25,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: 'Net Toplam'
            },
            'netToplamTutar': {
              type: 'text',
              position: { x: 170, y: 230 },
              width: 20,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: '1.100,00 $'
            },
            'kdvOrani': {
              type: 'text',
              position: { x: 140, y: 240 },
              width: 25,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: 'KDV %20'
            },
            'kdvTutar': {
              type: 'text',
              position: { x: 170, y: 240 },
              width: 20,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: '220,00 $'
            },
            'toplam': {
              type: 'text',
              position: { x: 140, y: 250 },
              width: 25,
              height: 8,
              fontSize: 12,
              fontColor: '#000000',
              content: 'Toplam'
            },
            'toplamTutar': {
              type: 'text',
              position: { x: 170, y: 250 },
              width: 20,
              height: 8,
              fontSize: 12,
              fontColor: '#000000',
              content: '1.320,00 $'
            },

            // Notlar ve şartlar
            'notlar': {
              type: 'text',
              position: { x: 20, y: 270 },
              width: 20,
              height: 6,
              fontSize: 10,
              fontColor: '#000000',
              content: 'Notlar'
            },
            'fiyatlar': {
              type: 'text',
              position: { x: 20, y: 280 },
              width: 170,
              height: 6,
              fontSize: 8,
              fontColor: '#666666',
              content: 'Fiyatlar: Teklifimiz USD cinsindan Merkez Bankası Döviz Satış Kuruna göre hazırlanmıştır.'
            },
            'odeme': {
              type: 'text',
              position: { x: 20, y: 288 },
              width: 170,
              height: 6,
              fontSize: 8,
              fontColor: '#666666',
              content: 'Ödeme: Siparişte %50 nakit avans, %50 iş bitimi nakit tahsil edilecektir.'
            },
            'garanti': {
              type: 'text',
              position: { x: 20, y: 296 },
              width: 170,
              height: 6,
              fontSize: 8,
              fontColor: '#666666',
              content: 'Garanti: Ürünlerimiz fatura tarihinden itibaren fabrikasyon hatalarına karşı 2(iki) yıl garantilidir'
            }
          };

          const designerInstance = new Designer({
            domContainer: designerRef.current,
            template: {
              ...defaultTemplate,
              schemas: [predefinedSchemas] // Tüm alanları PDFme'nin schema panel'ine ekle
            },
            plugins: { text, image, qrcode: barcodes.qrcode, table } as any,
            options: {
              theme: {
                token: {
                  colorPrimary: '#dc2626'
                }
              }
            }
          });

          // Designer yüklendikten sonra sample data'yı set et
          setTimeout(() => {
            try {
              const sampleData = {
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
              };
              
              console.log('Sample data set successfully');
            } catch (error) {
              console.error('Error setting sample data:', error);
            }
          }, 500);

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