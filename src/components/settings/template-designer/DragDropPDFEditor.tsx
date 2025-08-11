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
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState({
    no: true,
    aciklama: true,
    urunHizmet: true,
    miktar: true,
    birimFiyat: true,
    tutar: true,
    birim: false,
    indirim: false
  });

  // Tablo kolonlarını güncelle
  const updateTableColumns = () => {
    if (designer && selectedElement === 'urunTablosu') {
      const activeColumns = [];
      const columnNames = [];
      const widthPercentages = [];
      
      if (tableColumns.no) { activeColumns.push("No"); columnNames.push("no"); widthPercentages.push(8); }
      if (tableColumns.aciklama) { activeColumns.push("Açıklama"); columnNames.push("aciklama"); widthPercentages.push(30); }
      if (tableColumns.urunHizmet) { activeColumns.push("Ürün/Hizmet"); columnNames.push("urunHizmet"); widthPercentages.push(25); }
      if (tableColumns.miktar) { activeColumns.push("Miktar"); columnNames.push("miktar"); widthPercentages.push(12); }
      if (tableColumns.birim) { activeColumns.push("Birim"); columnNames.push("birim"); widthPercentages.push(10); }
      if (tableColumns.birimFiyat) { activeColumns.push("Birim Fiyat"); columnNames.push("birimFiyat"); widthPercentages.push(12.5); }
      if (tableColumns.indirim) { activeColumns.push("İndirim %"); columnNames.push("indirim"); widthPercentages.push(10); }
      if (tableColumns.tutar) { activeColumns.push("Tutar (KDV Hariç)"); columnNames.push("tutar"); widthPercentages.push(12.5); }

      try {
        const template = designer.getTemplate();
        const updatedSchemas = { ...template.schemas[0] };
        
        if (updatedSchemas.urunTablosu) {
          updatedSchemas.urunTablosu.head = activeColumns;
          updatedSchemas.urunTablosu.headWidthPercentages = widthPercentages;
        }
        
        designer.updateTemplate({
          ...template,
          schemas: [updatedSchemas]
        });
        
        console.log('Table columns updated:', activeColumns);
      } catch (error) {
        console.error('Error updating table columns:', error);
      }
    }
  };

  useEffect(() => {
    const initializeDesigner = async () => {
      try {
        // Delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { Designer } = await import('@pdfme/ui');
        const schemas = await import('@pdfme/schemas');
        const { text, image, barcodes, table, builtInPlugins } = schemas;
        
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

            // Ürün tablosu - Esnek kolon yapısı
            'urunTablosu': {
              type: 'table',
              position: { x: 20, y: 120 },
              width: 170,
              height: 80,
              showHead: true,
              head: ["No", "Açıklama", "Ürün/Hizmet", "Miktar", "Birim Fiyat", "Tutar (KDV Hariç)"],
              headWidthPercentages: [8, 30, 25, 12, 12.5, 12.5],
              tableStyles: { 
                borderWidth: 0.5, 
                borderColor: '#000000',
                cellPadding: 3
              },
              headStyles: { 
                fontSize: 9, 
                fontColor: '#ffffff', 
                backgroundColor: '#dc2626',
                alignment: 'center',
                fontName: 'NotoSansCJKjp-Regular'
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
            },

            // İmza alanı
            'musteriImza': {
              type: 'text',
              position: { x: 20, y: 310 },
              width: 60,
              height: 25,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Müşteri İmzası:\n\n\n_____________________\nAd Soyad:'
            },
            'sirketImza': {
              type: 'text',
              position: { x: 130, y: 310 },
              width: 60,
              height: 25,
              fontSize: 8,
              fontColor: '#000000',
              content: 'Şirket İmzası:\n\n\n_____________________\nYetkili:'
            }
          };

          const designerInstance = new Designer({
            domContainer: designerRef.current,
            template: {
              ...defaultTemplate,
              schemas: [predefinedSchemas] // Tüm alanları PDFme'nin schema panel'ine ekle
            },
            plugins: {
              text,
              image,
              qrcode: barcodes.qrcode,
              table,
              // Tüm mevcut barkod türleri
              japanpost: barcodes.japanpost,
              ean13: barcodes.ean13,
              ean8: barcodes.ean8,
              code39: barcodes.code39,
              code128: barcodes.code128,
              nw7: barcodes.nw7,
              itf14: barcodes.itf14,
              upca: barcodes.upca,
              upce: barcodes.upce,
              gs1datamatrix: barcodes.gs1datamatrix,
              pdf417: barcodes.pdf417,
              // BuiltIn plugins ekliyoruz
              builtInPlugins
            } as any,
            options: {
              theme: {
                token: {
                  colorPrimary: '#dc2626'
                }
              },
              ui: {
                sidebar: {
                  enabled: true,
                  width: 60
                },
                toolbar: {
                  enabled: true
                }
              }
            }
          });

          // Element seçim için DOM event listener
          const container = designerRef.current;
          if (container) {
            container.addEventListener('click', (e: any) => {
              // Tablo elementine tıklama kontrolü
              const target = e.target;
              if (target && target.closest && target.closest('[data-pdfme-key="urunTablosu"]')) {
                setSelectedElement('urunTablosu');
              } else {
                setSelectedElement(null);
              }
            });
          }

          // Designer yüklendikten sonra sample data'yı set et
          setTimeout(() => {
            try {
              const sampleData = {
                sirketLogo: 'NGS LOGO',
                sirketAdi: 'NGS TEKNOLOJİ VE GÜVENLİK SİSTEMLERİ',
                teklifFormuBaslik: 'TEKLİF FORMU',
                tarih: 'Tarih: 08.08.2025',
                gecerlilik: 'Geçerlilik: 15.08.2025',
                teklifNo: 'Teklif No: NT.2508-1364.01',
                hazirlayan: 'Hazırlayan: Nurettin Emre AYDIN',
                musteriBaslik: 'BAHÇEŞEHİR GÖLEVLERİ SİTESİ',
                musteriDetay: 'Sayın\nMustafa Bey,\nYapmış olduğumuz görüşmeler sonrasında hazırlamış olduğumuz fiyat teklifimizi değerlendirmenize sunarız.',
                urunTablosu: [
                  ['1', 'BİLGİSAYAR', 'HP Pro Tower 290 B6/C3S5 G9 İ7-13700 32GB 512GB SSD DOS', '1,00 Ad', '700,00 $', '700,00 $'],
                  ['2', 'Windows 11 Pro Lisans', '', '1,00 Ad', '165,00 $', '165,00 $'],
                  ['3', 'Uranium POE-G8002-96W 8 Port + 2 Port RJ45 Uplink POE Switch', '2,00 Ad', '80,00 $', '160,00 $'],
                  ['4', 'İçilik, Montaj, Mühendislik ve Süpervizyon Hizmetleri, Programlama, Test, Devreye alma', '1,00 Ad', '75,00 $', '75,00 $']
                ],
                brutToplam: 'Brüt Toplam',
                brutToplamTutar: '1.100,00 $',
                indirim: 'İndirim',
                indirimTutar: '0,00 $',
                netToplam: 'Net Toplam',
                netToplamTutar: '1.100,00 $',
                kdvOrani: 'KDV %20',
                kdvTutar: '220,00 $',
                toplam: 'Toplam',
                toplamTutar: '1.320,00 $',
                notlar: 'Notlar',
                fiyatlar: 'Fiyatlar: Teklifimiz USD cinsindan Merkez Bankası Döviz Satış Kuruna göre hazırlanmıştır.',
                odeme: 'Ödeme: Siparişte %50 nakit avans, %50 iş bitimi nakit tahsil edilecektir.',
                garanti: 'Garanti: Ürünlerimiz fatura tarihinden itibaren fabrikasyon hatalarına karşı 2(iki) yıl garantilidir',
                musteriImza: 'Müşteri İmzası:\n\n\n_____________________\nAd Soyad:',
                sirketImza: 'Şirket İmzası:\n\n\n_____________________\nYetkili:'
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
      {/* PDF Designer Area */}
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

      {/* Column Control Panel - Right Side */}
      {selectedElement === 'urunTablosu' && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Tablo Kolonları</h3>
              <Button 
                size="sm" 
                onClick={updateTableColumns}
                className="bg-primary text-white"
              >
                Uygula
              </Button>
            </div>
            
            <div className="space-y-3">
              {Object.entries(tableColumns).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {key === 'no' && 'No'}
                    {key === 'aciklama' && 'Açıklama'}
                    {key === 'urunHizmet' && 'Ürün/Hizmet'}
                    {key === 'miktar' && 'Miktar'}
                    {key === 'birim' && 'Birim'}
                    {key === 'birimFiyat' && 'Birim Fiyat'}
                    {key === 'indirim' && 'İndirim %'}
                    {key === 'tutar' && 'Tutar'}
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setTableColumns(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 mt-4">
              💡 İstediğiniz kolonları seçin ve "Uygula" düğmesine basın
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropPDFEditor;